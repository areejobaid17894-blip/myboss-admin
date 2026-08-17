import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '@/api/errors';
import { squadService, type Squad, type UnassignedEmployee } from '@/api/squad.service';
import { useI18n } from '@/i18n';

interface SquadManageModalProps {
  squad: Squad;
  maxMembers: number;
  onClose: () => void;
  onChanged: () => void;
}

export function SquadManageModal({ squad, maxMembers, onClose, onChanged }: SquadManageModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState(squad.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unassigned, setUnassigned] = useState<UnassignedEmployee[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const remaining = Math.max(0, maxMembers - squad.members.length);

  useEffect(() => {
    squadService
      .listUnassignedEmployees()
      .then((items) => setUnassigned(items))
      .catch((err) => setError(getApiErrorMessage(err, t)));
  }, [t, squad.id]);

  const pendingInvites = useMemo(
    () => (squad.joinRequests ?? []).filter((r) => r.status === 'pending' && r.kind === 'invite'),
    [squad.joinRequests],
  );

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  const rename = (e: FormEvent) => {
    e.preventDefault();
    const next = name.trim();
    if (!next || next === squad.name) return;
    void run(async () => {
      await squadService.adminRenameSquad(squad.id, next);
      setSuccess(t('squadRenamed'));
    });
  };

  const addMember = () => {
    const user = unassigned.find((u) => u.id === selectedUserId);
    if (!user) return;
    void run(async () => {
      await squadService.adminAssignMember({
        squadId: squad.id,
        userId: user.id,
        firstName: (user.firstName ?? '').trim() || 'Employee',
        lastName: (user.lastName ?? '').trim() || '-',
        building: user.buildingName || undefined,
        openToTravel: Boolean(user.openToTravel),
      });
      setSelectedUserId('');
      const items = await squadService.listUnassignedEmployees().catch(() => unassigned);
      setUnassigned(items.filter((u) => u.id !== user.id));
      setSuccess(t('squadMemberAdded'));
    });
  };

  return (
    <div className="ac-overlay" onClick={onClose} role="presentation">
      <div className="ac-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="squad-manage-title">
        <h2 id="squad-manage-title">{t('manageSquad')}</h2>
        <p className="ac-sub">
          {squad.squadCode} · {squad.members.length}/{maxMembers} {t('members')} · {remaining} {t('open')}
        </p>
        <p className="ac-hint">
          {t('remainingSeatsCopy')
            .replace('{remaining}', String(remaining))
            .replace('{max}', String(maxMembers))}
        </p>
        {error && <div className="ac-error">{error}</div>}
        {success && (
          <div className="ac-ai-note" style={{ background: 'var(--ac-green-soft)', color: '#2b8a5c' }}>
            {success}
          </div>
        )}

        <form onSubmit={rename} className="ac-field" style={{ marginBottom: 16 }}>
          <label htmlFor="squad-rename">{t('renameSquad')}</label>
          <div className="ac-toolbar">
            <input
              id="squad-rename"
              className="ac-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
            <button type="submit" className="ac-btn ac-btn-orange ac-btn-sm" disabled={saving || name.trim() === squad.name}>
              {t('save')}
            </button>
          </div>
        </form>

        <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>{t('squadMembers')}</h3>
        <div className="ac-tbl-wrap" style={{ marginBottom: 16 }}>
          <table>
            <thead>
              <tr>
                <th>{t('member')}</th>
                <th>{t('role')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {squad.members.map((m) => (
                <tr key={m.userId}>
                  <td>
                    {m.firstName} {m.lastName}
                  </td>
                  <td>
                    {m.role === 'leader' ? (
                      <span className="ac-badge ac-b-orange">★ {t('leader')}</span>
                    ) : (
                      <span className="ac-badge ac-b-gray">{t('member')}</span>
                    )}
                  </td>
                  <td>
                    {m.role === 'leader' ? (
                      <span className="ac-badge ac-b-orange">★ {t('leader')}</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="ac-btn ac-btn-ghost ac-btn-sm"
                          disabled={saving}
                          onClick={() => {
                            if (
                              !window.confirm(
                                t('makeLeaderConfirm')
                                  .replace('{squad}', squad.name)
                                  .replace('{name}', `${m.firstName} ${m.lastName}`),
                              )
                            ) {
                              return;
                            }
                            void run(async () => {
                              await squadService.adminTransferLeadership(squad.id, m.userId);
                              setSuccess(t('leaderTransferred'));
                            });
                          }}
                        >
                          {t('makeLeader')}
                        </button>
                        <button
                          type="button"
                          className="ac-btn ac-btn-ghost ac-btn-sm"
                          style={{ color: '#c0392b' }}
                          disabled={saving}
                          onClick={() => {
                            if (!window.confirm(t('removeMemberConfirm'))) return;
                            void run(async () => {
                              await squadService.adminRemoveMember(squad.id, m.userId);
                              setSuccess(t('squadMemberRemoved'));
                            });
                          }}
                        >
                          {t('removeMember')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pendingInvites.length > 0 && (
          <p className="ac-hint">
            {t('pendingInvitesReserveSeats')} ({pendingInvites.length})
          </p>
        )}
        <p className="ac-hint">{t('transferLeaderFirst')}</p>

        <div className="ac-field" style={{ marginBottom: 16 }}>
          <label htmlFor="add-unassigned">{t('addRegisteredEmployee')}</label>
          <div className="ac-toolbar">
            <select
              id="add-unassigned"
              className="ac-input"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={saving || remaining <= 0}
            >
              <option value="">{remaining <= 0 ? t('squadFullNoAdd') : t('selectEmployee')}</option>
              {unassigned
                .filter((u) => u.onboardingCompleted !== false)
                .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} · {u.email}
                </option>
              ))}
            </select>
            <button type="button" className="ac-btn ac-btn-orange ac-btn-sm" disabled={saving || !selectedUserId || remaining <= 0} onClick={addMember}>
              {t('addMember')}
            </button>
          </div>
        </div>

        <div className="ac-toolbar">
          <button type="button" className="ac-btn ac-btn-ghost" onClick={onClose} disabled={saving}>
            {t('close')}
          </button>
        </div>
        <div style={{ marginTop: 18, borderTop: '1px solid var(--ac-gray-line)', paddingTop: 16 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#c0392b', marginBottom: 8 }}>
            {t('dangerZone')}
          </div>
          <button
            type="button"
            className="ac-btn ac-btn-danger ac-btn-sm"
            disabled={saving}
            onClick={() => {
              if (!window.confirm(t('deleteSquadConfirm').replace('{name}', squad.name))) return;
              void run(async () => {
                await squadService.adminDeleteSquad(squad.id);
                onClose();
              });
            }}
          >
            🗑 {t('deleteSquad')}
          </button>
          <p className="ac-hint" style={{ marginTop: 8 }}>
            {t('deleteSquadHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
