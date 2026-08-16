import { FormEvent, useCallback, useEffect, useState } from 'react';
import { configService } from '@/api/config.service';
import { getApiErrorMessage } from '@/api/errors';
import { useI18n } from '@/i18n';

const DEFAULT_ADMIN_EMAIL = 'areej.obaid@orange.com';

export function SquadJoinDeadlineCard() {
  const { t } = useI18n();
  const [deadline, setDeadline] = useState('');
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await configService.getEmployeeSettings();
      setDeadline(data.squadJoinDeadline ?? '');
      setEmail((data.adminContactEmail ?? '').trim() || DEFAULT_ADMIN_EMAIL);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await configService.updateEmployeeSettings({
        squadJoinDeadline: deadline,
        adminContactEmail: email.trim() || DEFAULT_ADMIN_EMAIL,
      });
      setDeadline(data.squadJoinDeadline ?? '');
      setEmail((data.adminContactEmail ?? '').trim() || DEFAULT_ADMIN_EMAIL);
      setSuccess(t('squadJoinDeadlineSaved'));
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="ac-card"><p>{t('loadingConfig')}</p></div>;

  return (
    <form className="ac-card ac-vest-dates-card" onSubmit={handleSubmit}>
      <h2>{t('configSquadJoinDeadlineSection')}</h2>
      <p className="ac-sub">{t('configSquadJoinDeadlineDesc')}</p>
      <div className="ac-ai-note" style={{ background: 'var(--ac-blue-soft)', color: '#1a5f7a' }}>
        ℹ️ <span>{t('configSquadJoinHowTo')}</span>
      </div>
      {error && <div className="ac-error">{error}</div>}
      {success && (
        <div className="ac-ai-note" style={{ background: 'var(--ac-green-soft)', color: '#2b8a5c' }}>
          {success}
        </div>
      )}
      <div className="ac-grid ac-g2">
        <div className="ac-field">
          <label htmlFor="squad-join-deadline">{t('configSquadJoinDeadline')}</label>
          <input
            id="squad-join-deadline"
            type="date"
            className="ac-input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={saving}
          />
          <p className="ac-hint">{t('configSquadJoinDeadlineHint')}</p>
        </div>
        <div className="ac-field">
          <label htmlFor="admin-contact-email">{t('configAdminContactEmail')}</label>
          <input
            id="admin-contact-email"
            type="email"
            className="ac-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={saving}
            placeholder={DEFAULT_ADMIN_EMAIL}
          />
          <p className="ac-hint">{t('configAdminContactEmailHint')}</p>
        </div>
      </div>
      <div className="ac-toolbar">
        <button type="submit" className="ac-btn ac-btn-orange" disabled={saving}>
          {saving ? t('pleaseWait') : t('squadJoinDeadlineSave')}
        </button>
        <button type="button" className="ac-btn ac-btn-ghost" onClick={load} disabled={saving}>
          {t('retry')}
        </button>
      </div>
    </form>
  );
}
