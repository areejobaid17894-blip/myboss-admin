import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/api/errors';
import { squadService, type AdminInvite, type AdminInvitesResponse } from '@/api/squad.service';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';

function inviteeStatusLabel(
  status: AdminInvite['inviteeStatus'],
  t: (key: 'inviteeInSquad' | 'inviteeNoSquad' | 'inviteeUnregistered') => string,
) {
  if (status === 'in_squad') return t('inviteeInSquad');
  if (status === 'unregistered') return t('inviteeUnregistered');
  return t('inviteeNoSquad');
}

function inviteStatusLabel(
  status: string,
  t: (key: 'statusPending' | 'statusAccepted' | 'statusDeclined' | 'statusCancelled') => string,
) {
  if (status === 'pending') return t('statusPending');
  if (status === 'accepted') return t('statusAccepted');
  if (status === 'cancelled') return t('statusCancelled');
  return t('statusDeclined');
}

function statusBadgeClass(status: string) {
  if (status === 'pending') return 'ac-badge ac-b-yellow';
  if (status === 'accepted') return 'ac-badge ac-b-green';
  if (status === 'cancelled') return 'ac-badge ac-b-gray';
  return 'ac-badge ac-b-pink';
}

function inviteeBadgeClass(status: AdminInvite['inviteeStatus']) {
  if (status === 'in_squad') return 'ac-badge ac-b-blue';
  if (status === 'unregistered') return 'ac-badge ac-b-gray';
  return 'ac-badge ac-b-yellow';
}

export function InvitationsPage() {
  const { t } = useI18n();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [data, setData] = useState<AdminInvitesResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await squadService.listAdminInvites());
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancelInvite = async (invite: AdminInvite) => {
    setActingId(invite.id);
    try {
      await squadService.adminCancelInvite(invite.squadId, invite.id);
      logAction(`Cancelled invitation ${invite.id} (${invite.squadName} → ${invite.inviteeFirstName} ${invite.inviteeLastName}).`);
      showToast(t('inviteCancelled'));
      await load();
    } catch (err) {
      showToast(getApiErrorMessage(err, t));
    } finally {
      setActingId(null);
    }
  };

  const exportInvites = () => {
    const items = data?.items ?? [];
    downloadCsv('leader_invitations.csv', [
      ['Invitation ID', 'From squad', 'Leader', 'Invitee', 'Invitee ID', 'Invitee status', 'Sent', 'Status'],
      ...items.map((v) => [
        v.id,
        v.squadName,
        v.leaderName,
        `${v.inviteeFirstName} ${v.inviteeLastName}`.trim(),
        v.inviteeUserId,
        inviteeStatusLabel(v.inviteeStatus, t),
        v.sentAt,
        inviteStatusLabel(v.status, t),
      ]),
    ]);
  };

  if (loading && !data) return <p>{t('loadingData')}</p>;

  const summary = data?.summary ?? { total: 0, pending: 0, accepted: 0, declined: 0, cancelled: 0 };
  const items = data?.items ?? [];

  return (
    <>
      {error && <div className="ac-error">{error}</div>}
      <div className="ac-grid ac-g3" style={{ marginBottom: 20 }}>
        <div className="ac-kpi">
          <div className="ac-v">{summary.total}</div>
          <div className="ac-l">{t('kpiInvitesSent')}</div>
        </div>
        <div className="ac-kpi ac-k-yellow">
          <div className="ac-v">{summary.pending}</div>
          <div className="ac-l">{t('kpiInvitesPending')}</div>
        </div>
        <div className="ac-kpi ac-k-green">
          <div className="ac-v">{summary.accepted}</div>
          <div className="ac-l">{t('kpiInvitesAccepted')}</div>
        </div>
      </div>

      <div className="ac-card">
        <h2>{t('invitesTitle')}</h2>
        <p className="ac-sub">{t('invitesSub')}</p>
        <div className="ac-toolbar">
          <button type="button" className="ac-btn ac-btn-ghost" onClick={exportInvites}>
            {t('exportInvites')}
          </button>
          <button type="button" className="ac-btn ac-btn-ghost" onClick={() => void load()}>
            {t('refresh')}
          </button>
        </div>
        {items.length === 0 ? (
          <p className="ac-hint">{t('noInvites')}</p>
        ) : (
          <div className="ac-tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('invitation')}</th>
                  <th>{t('fromSquad')}</th>
                  <th>{t('leader')}</th>
                  <th>{t('invitee')}</th>
                  <th>{t('inviteeStatus')}</th>
                  <th>{t('sent')}</th>
                  <th>{t('status')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((invite) => (
                  <tr key={invite.id}>
                    <td>{invite.id.slice(0, 8)}</td>
                    <td>
                      <b>{invite.squadName}</b>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>
                        {invite.memberCount}/{invite.maxMembers} {t('members')}
                      </div>
                    </td>
                    <td>{invite.leaderName}</td>
                    <td>
                      <b>
                        {invite.inviteeFirstName} {invite.inviteeLastName}
                      </b>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)' }}>
                        {invite.inviteeUserId.slice(0, 8)}
                      </div>
                    </td>
                    <td>
                      <span className={inviteeBadgeClass(invite.inviteeStatus)}>
                        {inviteeStatusLabel(invite.inviteeStatus, t)}
                      </span>
                    </td>
                    <td>{new Date(invite.sentAt).toLocaleString()}</td>
                    <td>
                      <span className={statusBadgeClass(invite.status)}>{inviteStatusLabel(invite.status, t)}</span>
                    </td>
                    <td>
                      {invite.status === 'pending' ? (
                        <button
                          type="button"
                          className="ac-btn ac-btn-ghost ac-btn-sm"
                          disabled={actingId === invite.id}
                          onClick={() => void cancelInvite(invite)}
                        >
                          {t('cancelInvite')}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="ac-hint">{t('invitesHint')}</p>
      </div>
    </>
  );
}
