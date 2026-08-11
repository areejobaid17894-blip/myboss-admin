import { useMemo, useState } from 'react';
import { AddEmployeeCard } from '@/components/admin/AddEmployeeCard';
import { DemoTestAccountsCard } from '@/components/admin/DemoTestAccountsCard';
import { UserListFiltersBar } from '@/components/admin/UserListFilters';
import { squadService } from '@/api/squad.service';
import { useAdminData } from '@/hooks/useAdminData';
import { useUserList } from '@/hooks/useUserList';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';
import type { User } from '@/api/user.service';
import type { EnrichedSquad } from '@/hooks/useAdminData';

function suggestSquad(user: User, squads: EnrichedSquad[]) {
  const open = squads.filter((s) => s.members.length < 5);
  if (!open.length) return null;
  let pool = user.openToTravel
    ? open
    : open.filter((s) => s.base === user.governorate || s.destGov === user.governorate);
  let why = user.openToTravel
    ? 'Willing to travel — placed where slots are needed most'
    : `Matched to home governorate (${user.governorate ?? '—'})`;
  if (!pool.length) {
    pool = open;
    why = `No open squad in ${user.governorate ?? '—'} — nearest open squad`;
  }
  pool = [...pool].sort((a, b) => a.members.length - b.members.length);
  return { squad: pool[0], why };
}

export function UnregisteredPage() {
  const { t } = useI18n();
  const { loading: squadsLoading, error: squadsError, squads, reload: reloadSquads } = useAdminData();
  const {
    users: unregistered,
    total,
    page,
    totalPages,
    filters,
    loading: usersLoading,
    error: usersError,
    setPage,
    updateFilters,
    clearFilters,
    reload: reloadUsers,
  } = useUserList({ role: 'employee', onboardingCompleted: false });
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selections, setSelections] = useState<Record<string, string>>({});

  const loading = squadsLoading || usersLoading;
  const error = squadsError || usersError;

  const reload = () => {
    reloadSquads();
    reloadUsers();
  };

  const rows = useMemo(
    () =>
      unregistered.map((u) => {
        const suggestion = suggestSquad(u, squads);
        return {
          user: u,
          suggestion,
          selectedSquadId: selections[u.id] ?? suggestion?.squad.id ?? '',
        };
      }),
    [unregistered, squads, selections],
  );

  const exportUnreg = () =>
    downloadCsv(
      'unregistered_employees.csv',
      [
        ['User ID', 'Name', 'Email', 'Governorate', 'Travel', 'AI suggested squad'],
        ...rows
          .filter((r) => !hidden.has(r.user.id))
          .map((r) => [
            r.user.id,
            `${r.user.firstName} ${r.user.lastName}`,
            r.user.email,
            r.user.governorate ?? '—',
            r.user.openToTravel ? 'Yes' : 'No',
            r.suggestion?.squad.name ?? '—',
          ]),
      ],
    );

  const assignOne = async (row: (typeof rows)[0]) => {
    const sq = squads.find((s) => s.id === row.selectedSquadId);
    if (!sq) {
      showToast(t('chooseSquadFirst'));
      return;
    }
    if (sq.members.length >= 5 && !window.confirm(`${sq.name} — ${t('squadFullConfirm')}`)) return;
    try {
      await squadService.adminAssignMember({
        squadId: sq.id,
        userId: row.user.id,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        building: row.user.buildingName,
        openToTravel: row.user.openToTravel,
      });
      setHidden((prev) => new Set(prev).add(row.user.id));
      const src =
        row.selectedSquadId === row.suggestion?.squad.id
          ? 'per AI suggestion'
          : `admin override (${row.suggestion?.squad.name ?? '—'})`;
      logAction(`Assigned ${row.user.firstName} ${row.user.lastName} (${row.user.id}) to ${sq.name} — ${src}.`);
      showToast(`${row.user.firstName} → ${sq.name}`);
      reload();
    } catch {
      showToast(t('errorGeneric'));
    }
  };

  const nudgeAll = () => {
    logAction(`Sent registration reminder to ${total} unregistered employees.`);
    showToast(t('reminderSent'));
  };

  if (loading && !unregistered.length) return <p>{t('loadingData')}</p>;
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
    <>
      <div className="ac-grid ac-g2" style={{ marginBottom: 20 }}>
        <AddEmployeeCard onCreated={reload} />
        <DemoTestAccountsCard />
      </div>
      <div className="ac-card">
        <h2>{t('unregTitle')}</h2>
        <p className="ac-sub">{t('unregSub')}</p>
        <div className="ac-ai-note">
          ✦ <span>{t('unregAiNote')}</span>
        </div>

        <UserListFiltersBar
          filters={filters}
          onChange={updateFilters}
          onClear={() => clearFilters()}
          showOnboardingFilter={false}
        />

        <div className="ac-toolbar">
          <span className="ac-result-count">
            {rows.filter((r) => !hidden.has(r.user.id)).length} / {total} {t('unregistered')}
          </span>
          <button type="button" className="ac-btn ac-btn-orange" onClick={exportUnreg}>
            ⇩ {t('exportUnregistered')}
          </button>
          <button type="button" className="ac-btn ac-btn-outline" onClick={nudgeAll}>
            🔔 {t('nudgeUnregistered')}
          </button>
        </div>
        <div className="ac-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('employee')}</th>
                <th>{t('userId')}</th>
                <th>{t('governorate')}</th>
                <th>{t('travel')}</th>
                <th>{t('aiSuggestion')}</th>
                <th>{t('assignSquad')}</th>
                <th>{t('status')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((r) => !hidden.has(r.user.id))
                .map((r) => {
                  const isAi = r.selectedSquadId === r.suggestion?.squad.id;
                  return (
                    <tr key={r.user.id}>
                      <td>
                        <b>
                          {r.user.firstName} {r.user.lastName}
                        </b>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{r.user.email}</div>
                      </td>
                      <td>{r.user.id}</td>
                      <td>{r.user.governorate ?? '—'}</td>
                      <td>
                        {r.user.openToTravel ? (
                          <span className="ac-badge ac-b-green">{t('willing')}</span>
                        ) : (
                          <span className="ac-badge ac-b-gray">{t('no')}</span>
                        )}
                      </td>
                      <td>
                        <span className="ac-badge ac-b-purple">✦ {r.suggestion?.squad.name ?? '—'}</span>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--ac-gray-mid)',
                            marginTop: 3,
                            maxWidth: 230,
                            whiteSpace: 'normal',
                          }}
                        >
                          {r.suggestion?.why ?? t('allSquadsFull')}
                        </div>
                      </td>
                      <td>
                        <select
                          className={`ac-inline-select ${!isAi ? 'ac-modified' : ''}`}
                          value={r.selectedSquadId}
                          onChange={(e) =>
                            setSelections((prev) => ({ ...prev, [r.user.id]: e.target.value }))
                          }
                        >
                          {[...squads]
                            .sort((a, b) => a.members.length - b.members.length)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} — {s.members.length}/5
                                {s.members.length >= 5 ? ` (${t('full')})` : ` · ${5 - s.members.length} ${t('open')}`}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>
                        {isAi ? (
                          <span className="ac-badge ac-b-purple">AI</span>
                        ) : (
                          <span className="ac-badge ac-b-orange">{t('adminOverride')}</span>
                        )}
                      </td>
                      <td>
                        <button type="button" className="ac-btn ac-btn-sm ac-btn-orange" onClick={() => assignOne(r)}>
                          {t('assign')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {rows.filter((r) => !hidden.has(r.user.id)).length === 0 && (
          <p className="ac-hint">{t('noUnregistered')}</p>
        )}

        {totalPages > 1 && (
          <div className="ac-pagination">
            <button
              type="button"
              className="ac-btn ac-btn-outline ac-btn-sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              {t('previousPage')}
            </button>
            <span>{t('page')} {page} / {totalPages}</span>
            <button
              type="button"
              className="ac-btn ac-btn-outline ac-btn-sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              {t('nextPage')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
