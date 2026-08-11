import { useMemo } from 'react';
import { AddEmployeeCard } from '@/components/admin/AddEmployeeCard';
import { UserListFiltersBar } from '@/components/admin/UserListFilters';
import { useUserList } from '@/hooks/useUserList';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';

export function UsersPage() {
  const { t } = useI18n();
  const {
    users,
    total,
    page,
    totalPages,
    filters,
    loading,
    error,
    setPage,
    updateFilters,
    clearFilters,
    reload,
  } = useUserList({ role: 'employee' });

  const exportUsers = () =>
    downloadCsv(
      'employees.csv',
      [
        ['User ID', 'First name', 'Last name', 'Email', 'Role', 'Registered', 'Governorate', 'Squad ID', 'Travel'],
        ...users.map((u) => [
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.role,
          u.onboardingCompleted ? 'Yes' : 'No',
          u.governorate ?? '—',
          u.squadId ?? '—',
          u.openToTravel ? 'Yes' : 'No',
        ]),
      ],
    );

  const summary = useMemo(() => {
    const registered = users.filter((u) => u.onboardingCompleted).length;
    return { registered, unregistered: users.length - registered };
  }, [users]);

  if (loading && !users.length) return <p>{t('loadingUsers')}</p>;
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
        <div className="ac-card" style={{ marginBottom: 0 }}>
          <h2>{t('usersListTitle')}</h2>
          <p className="ac-sub">{total} {t('employees')} — {t('usersSubtitle')}</p>
          <div className="ac-grid ac-g2">
            <div className="ac-kpi ac-k-green" style={{ marginBottom: 0 }}>
              <div className="ac-v">{summary.registered}</div>
              <div className="ac-l">{t('registered')}</div>
            </div>
            <div className="ac-kpi" style={{ marginBottom: 0 }}>
              <div className="ac-v">{summary.unregistered}</div>
              <div className="ac-l">{t('unregistered')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ac-card">
        <h2>{t('usersTitle')}</h2>
        <p className="ac-sub">{t('usersSubtitle')}</p>

        <UserListFiltersBar
          filters={filters}
          onChange={updateFilters}
          onClear={() => clearFilters()}
        />

        <div className="ac-toolbar">
          <span className="ac-result-count">
            {users.length} / {total} {t('employees')}
          </span>
          <button type="button" className="ac-btn ac-btn-orange" onClick={exportUsers} disabled={!users.length}>
            ⇩ {t('exportUsersCsv')}
          </button>
        </div>

        <div className="ac-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('employee')}</th>
                <th>{t('userId')}</th>
                <th>{t('role')}</th>
                <th>{t('governorate')}</th>
                <th>{t('status')}</th>
                <th>{t('travel')}</th>
                <th>{t('squad')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>
                      {u.firstName} {u.lastName}
                    </b>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{u.email}</div>
                  </td>
                  <td>{u.id}</td>
                  <td>
                    <span className="ac-badge ac-b-gray">{u.role}</span>
                  </td>
                  <td>{u.governorate ?? '—'}</td>
                  <td>
                    {u.onboardingCompleted ? (
                      <span className="ac-badge ac-b-green">{t('registered')}</span>
                    ) : (
                      <span className="ac-badge ac-b-orange">{t('unregistered')}</span>
                    )}
                  </td>
                  <td>
                    {u.openToTravel ? (
                      <span className="ac-badge ac-b-green">{t('willing')}</span>
                    ) : (
                      <span className="ac-badge ac-b-gray">{t('no')}</span>
                    )}
                  </td>
                  <td>{u.squadId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!users.length && <p className="ac-hint">{t('usersEmptyFiltered')}</p>}

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
            <span>
              {t('page')} {page} / {totalPages}
            </span>
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
