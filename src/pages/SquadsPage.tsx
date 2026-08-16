import { useMemo, useState } from 'react';
import {
  EmployeeSettingsCard,
  SQUAD_SETTINGS_FIELDS,
} from '@/components/admin/EmployeeSettingsCard';
import { SquadJoinDeadlineCard } from '@/components/admin/SquadJoinDeadlineCard';
import { SquadManageModal } from '@/components/admin/SquadManageModal';
import { useAdminData } from '@/hooks/useAdminData';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';
import type { Squad } from '@/api/squad.service';

type ViewMode = 'squads' | 'employees';

export function SquadsPage() {
  const { t } = useI18n();
  const { loading, error, squads, members, settings, reload } = useAdminData();
  const [view, setView] = useState<ViewMode>('squads');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const maxMembers = settings?.maxUsersPerSquad ?? 5;

  const filteredSquads = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return squads;
    return squads.filter((s) => `${s.name}${s.squadCode}`.toLowerCase().includes(q));
  }, [squads, search]);

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      `${m.squadName}${m.name}${m.userId}`.toLowerCase().includes(q),
    );
  }, [members, search]);

  const exportSummary = () =>
    downloadCsv(
      'squads_summary.csv',
      [
        ['Squad ID', 'Squad name', 'Leader', 'Members', 'Base', 'Destination', 'Travel eligible', 'Surveys', 'Target'],
        ...squads.map((s) => [
          s.squadCode,
          s.name,
          s.leaderName,
          s.members.length,
          s.base,
          `${s.dest} (${s.destGov})`,
          s.travelEligible ? 'Yes' : 'No',
          s.surveys,
          s.target,
        ]),
      ],
    );

  const exportFull = () =>
    downloadCsv(
      'squads_full_data.csv',
      [
        ['Squad ID', 'Squad name', 'Member', 'Role', 'User ID', 'Vest', 'Travel', 'Base', 'Destination'],
        ...members.map((m) => [
          m.squadCode,
          m.squadName,
          m.name,
          m.role,
          m.userId,
          m.vest,
          m.travel ? 'Yes' : 'No',
          m.base,
          `${m.dest} (${m.destGov})`,
        ]),
      ],
    );

  if (loading) return <p>{t('loadingData')}</p>;
  if (error) {
    return (
      <div>
        <div className="ac-error">{error}</div>
        <button type="button" className="ac-btn ac-btn-orange" onClick={reload}>
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="ac-grid" style={{ gap: 16 }}>
      <EmployeeSettingsCard
        titleKey="configSectionSquad"
        descKey="configSectionSquadDesc"
        fields={SQUAD_SETTINGS_FIELDS}
        onSaved={() => reload()}
      />
      <SquadJoinDeadlineCard />
      <div className="ac-card">
      <h2>{t('squadsFullTitle')}</h2>
      <p className="ac-sub">{t('squadsFullSub')}</p>
      <div className="ac-toolbar">
        <div className="ac-seg">
          <button
            type="button"
            className={view === 'squads' ? 'ac-on' : ''}
            onClick={() => setView('squads')}
          >
            {t('squadView')}
          </button>
          <button
            type="button"
            className={view === 'employees' ? 'ac-on' : ''}
            onClick={() => setView('employees')}
          >
            {t('employeeView')}
          </button>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={view === 'squads' ? t('searchSquads') : t('searchMembers')}
        />
        <button type="button" className="ac-btn ac-btn-orange" onClick={view === 'squads' ? exportSummary : exportFull}>
          ⇩ {view === 'squads' ? t('exportSquadSummary') : t('exportFullData')}
        </button>
      </div>

      {view === 'squads' ? (
        <div className="ac-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('squad')}</th>
                <th>{t('members')}</th>
                <th>{t('leader')}</th>
                <th>{t('base')}</th>
                <th>{t('destination')}</th>
                <th>{t('travelWilling')}</th>
                <th>{t('travelStatus')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredSquads.map((s) => (
                <tr key={s.id}>
                  <td>
                    <b>{s.name}</b>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{s.squadCode}</div>
                  </td>
                  <td>
                    <b>
                      {s.members.length}/{maxMembers}
                    </b>
                    {s.members.length < maxMembers && (
                      <span className="ac-badge ac-b-yellow" style={{ marginInlineStart: 6 }}>
                        {(s.remainingSeats ?? maxMembers - s.members.length)} {t('open')}
                      </span>
                    )}
                  </td>
                  <td>{s.leaderName}</td>
                  <td>{s.base}</td>
                  <td>
                    <b>{s.dest}</b>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{s.destGov}</div>
                  </td>
                  <td>
                    {s.travelWilling}/{s.members.length}
                  </td>
                  <td>
                    {s.travelEligible ? (
                      <span className="ac-badge ac-b-green">{t('willingToTravel')}</span>
                    ) : (
                      <span className="ac-badge ac-b-gray">{t('baseOnly')}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ac-btn ac-btn-outline ac-btn-sm"
                      onClick={() => setEditingId(s.id)}
                    >
                      {t('manageSquad')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ac-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('squad')}</th>
                <th>{t('member')}</th>
                <th>{t('role')}</th>
                <th>{t('userId')}</th>
                <th>{t('vest')}</th>
                <th>{t('travel')}</th>
                <th>{t('destination')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={`${m.squadId}-${m.userId}`}>
                  <td>
                    <b>{m.squadName}</b>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{m.squadCode}</div>
                  </td>
                  <td>{m.name}</td>
                  <td>
                    {m.role === 'leader' ? (
                      <span className="ac-badge ac-b-orange">★ {t('leader')}</span>
                    ) : (
                      <span className="ac-badge ac-b-gray">{t('member')}</span>
                    )}
                  </td>
                  <td>{m.userId}</td>
                  <td>
                    <span className="ac-badge ac-b-blue">{m.vest}</span>
                  </td>
                  <td>
                    {m.travel ? (
                      <span className="ac-badge ac-b-green">{t('willing')}</span>
                    ) : (
                      <span className="ac-badge ac-b-gray">{t('no')}</span>
                    )}
                  </td>
                  <td>
                    <b>{m.dest}</b>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{m.destGov}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="ac-hint">{t('squadsTravelHint')}</p>
    </div>
    {editingId && squads.some((s) => s.id === editingId) && (
      <SquadManageModal
        squad={toManageSquad(squads.find((s) => s.id === editingId)!, maxMembers)}
        maxMembers={maxMembers}
        onClose={() => setEditingId(null)}
        onChanged={reload}
      />
    )}
    </div>
  );
}

function toManageSquad(
  s: {
    id: string;
    squadCode: string;
    name: string;
    badge: string;
    base: string;
    leaderId: string;
    members: Squad['members'];
    destinationValidated: boolean;
    surveyTarget: number;
    createdAt: string;
    remainingSeats?: number;
    maxMembers?: number;
    joinRequests?: Squad['joinRequests'];
  },
  maxMembers: number,
): Squad {
  return {
    id: s.id,
    squadCode: s.squadCode,
    name: s.name,
    badge: s.badge,
    governorate: s.base,
    leaderId: s.leaderId,
    members: s.members,
    destinationValidated: s.destinationValidated,
    surveyTarget: s.surveyTarget,
    createdAt: s.createdAt,
    remainingSeats: s.remainingSeats,
    maxMembers: s.maxMembers ?? maxMembers,
    joinRequests: s.joinRequests,
  };
}
