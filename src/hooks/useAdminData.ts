import { useCallback, useEffect, useMemo, useState } from 'react';
import { configService, type EmployeeSettings } from '@/api/config.service';
import { galleryService, type GalleryItem } from '@/api/gallery.service';
import { squadService, type Squad, type SquadStats } from '@/api/squad.service';
import { surveyService, type CompanyReport } from '@/api/survey.service';
import { userService, type User } from '@/api/user.service';
import { pickAiDestination } from '@/lib/adminGeo';
import { loadDestinationOverrides, type DestinationOverride } from '@/lib/adminStores';

export interface EnrichedMember {
  userId: string;
  name: string;
  role: 'leader' | 'member';
  squadId: string;
  squadCode: string;
  squadName: string;
  base: string;
  dest: string;
  destGov: string;
  vest: string;
  travel: boolean;
  department: string;
  email: string;
}

export interface EnrichedSquad {
  id: string;
  squadCode: string;
  name: string;
  base: string;
  members: Squad['members'];
  travelWilling: number;
  travelEligible: boolean;
  aiDestGov: string;
  aiDest: string;
  destGov: string;
  dest: string;
  destModified: boolean;
  surveys: number;
  target: number;
  leaderName: string;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function enrichSquads(
  squads: Squad[],
  overrides: Record<string, DestinationOverride>,
  surveyTarget: number,
  totalResponses: number,
): EnrichedSquad[] {
  const perSquad = squads.length ? Math.max(1, Math.floor(totalResponses / squads.length)) : 0;

  return squads.map((s, idx) => {
    const members = s.members ?? [];
    const travelWilling = members.filter((m) => m.openToTravel).length;
    const travelEligible = travelWilling >= 3;
    const ai = pickAiDestination(s.governorate, travelEligible, hashSeed(s.id));
    const stored = overrides[s.id];
    const persisted = s.destination?.split('|');
    const destGov = stored?.destGov ?? persisted?.[0] ?? ai.destGov;
    const dest = stored?.dest ?? persisted?.[1] ?? ai.dest;
    const destModified = stored?.modified ?? Boolean(s.destinationValidated && persisted?.length === 2);
    const leader = members.find((m) => m.role === 'leader') ?? members[0];

    return {
      id: s.id,
      squadCode: s.squadCode,
      name: s.name,
      base: s.governorate,
      members,
      travelWilling,
      travelEligible,
      aiDestGov: ai.destGov,
      aiDest: ai.dest,
      destGov,
      dest,
      destModified,
      surveys: perSquad + (idx % 7),
      target: s.surveyTarget || surveyTarget,
      leaderName: leader ? `${leader.firstName} ${leader.lastName}` : '—',
    };
  });
}

function buildMembers(
  squads: EnrichedSquad[],
  users: User[],
): EnrichedMember[] {
  const userMap = new Map(users.map((u) => [u.id, u]));

  return squads.flatMap((s) =>
    (s.members ?? []).map((m) => {
      const user = userMap.get(m.userId);
      return {
        userId: m.userId,
        name: `${m.firstName} ${m.lastName}`,
        role: m.role,
        squadId: s.id,
        squadCode: s.squadCode,
        squadName: s.name,
        base: s.base,
        dest: s.dest,
        destGov: s.destGov,
        vest: user?.vestSize ?? '—',
        travel: Boolean(m.openToTravel ?? user?.openToTravel),
        department: user?.buildingName?.split(',')[0] ?? '—',
        email: user?.email ?? '—',
      };
    }),
  );
}

export function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<SquadStats | null>(null);
  const [squadsRaw, setSquadsRaw] = useState<Squad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<EmployeeSettings | null>(null);
  const [destOverrides, setDestOverrides] = useState(loadDestinationOverrides);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, squadsRes, usersRes, reportRes, galleryRes, settingsRes] = await Promise.all([
        squadService.getStats(),
        squadService.listAdmin(),
        userService.getAll(1, 100, { role: 'employee' }),
        surveyService.getCompanyReport().catch(() => null),
        galleryService.list(undefined, 'employee').catch(() => [] as GalleryItem[]),
        configService.getEmployeeSettings().catch(() => null),
      ]);
      setStats(statsRes);
      setSquadsRaw(Array.isArray(squadsRes) ? squadsRes : []);
      setUsers(usersRes.data?.items ?? []);
      setReport(reportRes);
      setGallery(galleryRes);
      setSettings(settingsRes?.data ?? null);
      setDestOverrides(loadDestinationOverrides());
    } catch (err) {
      console.error('Admin data load failed', err);
      setError('Failed to load admin data. Sign in again or use http://127.0.0.1:8090/login (not :8081).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const surveyTarget = settings?.surveyTargetPerSquad ?? 40;
  const totalResponses = report?.totalResponses ?? 0;

  const squads = useMemo(
    () => enrichSquads(squadsRaw, destOverrides, surveyTarget, totalResponses),
    [squadsRaw, destOverrides, surveyTarget, totalResponses],
  );

  const members = useMemo(() => buildMembers(squads, users), [squads, users]);

  const registeredCount = users.filter((u) => u.onboardingCompleted).length;
  const unregistered = users.filter((u) => !u.onboardingCompleted);

  return {
    loading,
    error,
    stats,
    squads,
    squadsRaw,
    members,
    users,
    report,
    gallery,
    settings,
    destOverrides,
    setDestOverrides,
    registeredCount,
    unregistered,
    reload,
  };
}
