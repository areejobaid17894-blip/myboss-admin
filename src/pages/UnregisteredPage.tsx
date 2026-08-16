import { useCallback, useEffect, useState } from 'react';
import { AddEmployeeCard } from '@/components/admin/AddEmployeeCard';
import { DemoTestAccountsCard } from '@/components/admin/DemoTestAccountsCard';
import {
  squadService,
  type AllocationProposal,
  type AllocationProposalsResponse,
} from '@/api/squad.service';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';

export function UnregisteredPage() {
  const { t } = useI18n();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AllocationProposalsResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>(
    'pending',
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await squadService.listAllocationProposals(
        statusFilter === 'all' ? undefined : statusFilter,
      );
      setData(res);
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAllocation = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await squadService.runAllocation();
      setData(res);
      setStatusFilter('pending');
      logAction(`Ran squad allocation — ${res.summary.total} proposal(s).`);
      showToast(t('allocRunDone').replace('{n}', String(res.summary.total)));
    } catch {
      showToast(t('errorGeneric'));
    } finally {
      setRunning(false);
    }
  };

  const confirmOne = async (p: AllocationProposal) => {
    setActingId(p.id);
    try {
      await squadService.confirmAllocation(p.id);
      logAction(`Confirmed allocation: ${p.firstName} ${p.lastName} → ${p.squadName}.`);
      showToast(`${p.firstName} → ${p.squadName}`);
      await load();
    } catch {
      showToast(t('errorGeneric'));
    } finally {
      setActingId(null);
    }
  };

  const rejectOne = async (p: AllocationProposal) => {
    setActingId(p.id);
    try {
      await squadService.rejectAllocation(p.id);
      logAction(`Rejected allocation: ${p.firstName} ${p.lastName} → ${p.squadName}.`);
      showToast(t('allocRejected'));
      await load();
    } catch {
      showToast(t('errorGeneric'));
    } finally {
      setActingId(null);
    }
  };

  const exportCsv = () => {
    const items = data?.items ?? [];
    downloadCsv('squad_allocation_proposals.csv', [
      [
        'User ID',
        'Name',
        'Email',
        'Governorate',
        'Preferred',
        'Travel',
        'Proposed squad',
        'New squad',
        'Reason',
        'Status',
      ],
      ...items.map((p) => [
        p.userId,
        `${p.firstName} ${p.lastName}`,
        p.email,
        p.governorate ?? '—',
        (p.preferredGovernorates ?? []).join('; ') || '—',
        p.openToTravel ? 'Yes' : 'No',
        p.squadName,
        p.createsNewSquad ? 'Yes' : 'No',
        p.reason,
        p.status,
      ]),
    ]);
  };

  const items = data?.items ?? [];
  const summary = data?.summary;

  return (
    <>
      <div className="ac-grid ac-g2" style={{ marginBottom: 20 }}>
        <AddEmployeeCard onCreated={load} />
        <DemoTestAccountsCard />
      </div>
      <div className="ac-card">
        <h2>{t('allocTitle')}</h2>
        <p className="ac-sub">{t('allocSub')}</p>
        <div className="ac-ai-note">
          <span>{t('allocNote')}</span>
        </div>

        <div className="ac-toolbar">
          <button
            type="button"
            className="ac-btn ac-btn-orange"
            disabled={running}
            onClick={() => void runAllocation()}
          >
            {running ? t('allocRunning') : t('allocRun')}
          </button>
          <button type="button" className="ac-btn ac-btn-outline" onClick={() => void load()}>
            {t('refresh')}
          </button>
          <button type="button" className="ac-btn ac-btn-ghost" onClick={exportCsv} disabled={!items.length}>
            ⇩ {t('allocExport')}
          </button>
          {summary && (
            <span className="ac-result-count">
              {t('allocSummary')
                .replace('{pending}', String(summary.pending))
                .replace('{confirmed}', String(summary.confirmed))
                .replace('{rejected}', String(summary.rejected))}
            </span>
          )}
        </div>

        <div className="ac-toolbar" style={{ gap: 8 }}>
          {(['pending', 'confirmed', 'rejected', 'all'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`ac-btn ac-btn-sm ${statusFilter === s ? 'ac-btn-orange' : 'ac-btn-outline'}`}
              onClick={() => setStatusFilter(s)}
            >
              {t(
                s === 'pending'
                  ? 'allocFilterPending'
                  : s === 'confirmed'
                    ? 'allocFilterConfirmed'
                    : s === 'rejected'
                      ? 'allocFilterRejected'
                      : 'allocFilterAll',
              )}
            </button>
          ))}
        </div>

        {loading && <p>{t('loadingData')}</p>}
        {error && (
          <div>
            <div className="ac-error">{error}</div>
            <button type="button" className="ac-btn ac-btn-orange" onClick={() => void load()}>
              {t('retry')}
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="ac-tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('employee')}</th>
                    <th>{t('governorate')}</th>
                    <th>{t('allocPreferred')}</th>
                    <th>{t('travel')}</th>
                    <th>{t('allocProposedSquad')}</th>
                    <th>{t('allocReason')}</th>
                    <th>{t('status')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <b>
                          {p.firstName} {p.lastName}
                        </b>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>{p.email}</div>
                      </td>
                      <td>{p.governorate ?? '—'}</td>
                      <td>
                        {(p.preferredGovernorates ?? []).length
                          ? p.preferredGovernorates.join(', ')
                          : '—'}
                      </td>
                      <td>
                        {p.openToTravel ? (
                          <span className="ac-badge ac-b-green">{t('willing')}</span>
                        ) : (
                          <span className="ac-badge ac-b-gray">{t('no')}</span>
                        )}
                      </td>
                      <td>
                        <b>{p.squadName}</b>
                        {p.createsNewSquad && (
                          <div style={{ marginTop: 4 }}>
                            <span className="ac-badge ac-b-blue">{t('allocNewSquad')}</span>
                            {p.isLeaderOfNewSquad && (
                              <span className="ac-badge ac-b-green" style={{ marginInlineStart: 4 }}>
                                {t('leader')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ maxWidth: 260, whiteSpace: 'normal', fontSize: '0.78rem' }}>
                        {p.reason}
                      </td>
                      <td>
                        <span
                          className={`ac-badge ${
                            p.status === 'pending'
                              ? 'ac-b-orange'
                              : p.status === 'confirmed'
                                ? 'ac-b-green'
                                : 'ac-b-gray'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {p.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="ac-btn ac-btn-sm ac-btn-orange"
                              disabled={actingId === p.id}
                              onClick={() => void confirmOne(p)}
                            >
                              {t('confirm')}
                            </button>{' '}
                            <button
                              type="button"
                              className="ac-btn ac-btn-sm ac-btn-outline"
                              disabled={actingId === p.id}
                              onClick={() => void rejectOne(p)}
                            >
                              {t('reject')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {items.length === 0 && <p className="ac-hint">{t('allocEmpty')}</p>}
          </>
        )}
      </div>
    </>
  );
}
