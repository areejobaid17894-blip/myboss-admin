import { useCallback, useEffect, useMemo, useState } from 'react';
import { configService, type EmployeeSettings } from '@/api/config.service';
import { galleryService, type GalleryItem } from '@/api/gallery.service';
import { squadService, type Squad, type SquadStats } from '@/api/squad.service';
import { surveyService, type CompanyReport } from '@/api/survey.service';
import { fetchAllUsers, type User } from '@/api/user.service';
import { pickSuggestedDestination } from '@/lib/adminGeo';
import { loadDestinationOverrides, type DestinationOverride } from '@/lib/adminStores';
import { useI18n } from '@/i18n';

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
  suggestedDestGov: string;
  suggestedDest: string;
  destGov: string;
  dest: string;
  destModified: boolean;
  surveys: number;
  target: number;
  leaderName: string;
  remainingSeats?: number;
  maxMembers?: number;
  joinRequests?: Squad['joinRequests'];
  leaderId: string;
  badge: string;
  destinationValidated: boolean;
  surveyTarget: number;
  createdAt: string;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function enrichSquads(
  squads: Squad[],
  users: User[],
  overrides: Record<string, DestinationOverride>,
  surveyTarget: number,
  totalResponses: number,
): EnrichedSquad[] {
  const perSquad = squads.length ? Math.max(1, Math.floor(totalResponses / squads.length)) : 0;
  const userMap = new Map(users.map((u) => [u.id, u]));

  return squads.map((s, idx) => {
    const members = s.members ?? [];
    const travelWilling = members.filter((m) => {
      const user = userMap.get(m.userId);
      // User profile is source of truth for travel willingness.
      return Boolean(user?.openToTravel ?? m.openToTravel);
    }).length;
    const travelEligible = travelWilling >= 3;
    const suggested = pickSuggestedDestination(s.governorate, travelEligible, hashSeed(s.id));
    const stored = overrides[s.id];
    const persisted = s.destination?.split('|');
    const destGov = stored?.destGov ?? persisted?.[0] ?? suggested.destGov;
    const dest = stored?.dest ?? persisted?.[1] ?? suggested.dest;
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
      suggestedDestGov: suggested.destGov,
      suggestedDest: suggested.dest,
      destGov,
      dest,
      destModified,
      surveys: perSquad + (idx % 7),
      target: s.surveyTarget || surveyTarget,
      leaderName: leader ? `${leader.firstName} ${leader.lastName}` : '—',
      remainingSeats: s.remainingSeats,
      maxMembers: s.maxMembers,
      joinRequests: s.joinRequests,
      leaderId: s.leaderId,
      badge: s.badge,
      destinationValidated: s.destinationValidated,
      surveyTarget: s.surveyTarget,
      createdAt: s.createdAt,
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
        travel: Boolean(user?.openToTravel ?? m.openToTravel),
        department: user?.buildingName?.split(',')[0] ?? '—',
        email: user?.email ?? '—',
      };
    }),
  );
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

export function useAdminData() {
  const { t } = useI18n();
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
      const [statsRes, squadsRes, usersRes, reportRes, galleryRes, settingsRes] = await Promise.allSettled([
        squadService.getStats(),
        squadService.listAdmin(),
        fetchAllUsers({ role: 'employee' }),
        surveyService.getCompanyReport(),
        galleryService.list(undefined, 'employee'),
        configService.getEmployeeSettings(),
      ]);

      setStats(settledValue(statsRes, null));
      setSquadsRaw(settledValue(squadsRes, [] as Squad[]));
      setUsers(settledValue(usersRes, [] as User[]));
      setReport(settledValue(reportRes, null));
      setGallery(settledValue(galleryRes, [] as GalleryItem[]));
      setSettings(settledValue(settingsRes, null)?.data ?? null);
      setDestOverrides(loadDestinationOverrides());

      if (statsRes.status === 'rejected' && squadsRes.status === 'rejected') {
        console.error('Admin data load failed', statsRes.reason, squadsRes.reason, usersRes);
        setError(t('adminDataLoadFailed'));
      } else if (squadsRes.status === 'rejected') {
        console.error('Admin squads load failed', squadsRes.reason);
        setError(t('adminDataLoadFailed'));
      } else if (usersRes.status === 'rejected') {
        console.error('Admin users load failed', usersRes.reason);
      }
    } catch (err) {
      console.error('Admin data load failed', err);
      setError(t('adminDataLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    reload();
  }, [reload]);

  const surveyTarget = settings?.surveyTargetPerSquad ?? 40;
  const totalResponses = report?.totalResponses ?? 0;

  const squads = useMemo(
    () => enrichSquads(squadsRaw, users, destOverrides, surveyTarget, totalResponses),
    [squadsRaw, users, destOverrides, surveyTarget, totalResponses],
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
