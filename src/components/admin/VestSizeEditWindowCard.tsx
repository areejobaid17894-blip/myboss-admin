import { FormEvent, useCallback, useEffect, useState } from 'react';
import { configService } from '@/api/config.service';
import { getApiErrorMessage } from '@/api/errors';
import { useI18n } from '@/i18n';

export function VestSizeEditWindowCard() {
  const { t } = useI18n();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await configService.getEmployeeSettings();
      setStart(data.vestSizeEditWindowStart ?? '');
      setEnd(data.vestSizeEditWindowEnd ?? '');
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
        vestSizeEditWindowStart: start,
        vestSizeEditWindowEnd: end,
      });
      setStart(data.vestSizeEditWindowStart ?? '');
      setEnd(data.vestSizeEditWindowEnd ?? '');
      setSuccess(t('vestSizeDatesSaved'));
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="ac-card"><p>{t('loadingConfig')}</p></div>;

  return (
    <form className="ac-card ac-vest-dates-card" onSubmit={handleSubmit}>
      <h2>{t('configVestSizeSection')}</h2>
      <p className="ac-sub">{t('configVestSizeSectionDesc')}</p>
      <div className="ac-ai-note" style={{ background: 'var(--ac-blue-soft)', color: '#1a5f7a' }}>
        ℹ️ <span>{t('configVestSizeHowTo')}</span>
      </div>
      {error && <div className="ac-error">{error}</div>}
      {success && (
        <div className="ac-ai-note" style={{ background: 'var(--ac-green-soft)', color: '#2b8a5c' }}>
          {success}
        </div>
      )}
      <div className="ac-grid ac-g2">
        <div className="ac-field">
          <label htmlFor="vest-edit-start">{t('configVestSizeStart')}</label>
          <input
            id="vest-edit-start"
            type="date"
            className="ac-input"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={saving}
          />
          <p className="ac-hint">{t('configVestSizeStartHint')}</p>
        </div>
        <div className="ac-field">
          <label htmlFor="vest-edit-end">{t('configVestSizeEnd')}</label>
          <input
            id="vest-edit-end"
            type="date"
            className="ac-input"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            disabled={saving}
            min={start || undefined}
          />
          <p className="ac-hint">{t('configVestSizeEndHint')}</p>
        </div>
      </div>
      <div className="ac-toolbar">
        <button type="submit" className="ac-btn ac-btn-orange" disabled={saving}>
          {saving ? t('pleaseWait') : t('vestSizeDatesSave')}
        </button>
        <button type="button" className="ac-btn ac-btn-ghost" onClick={load} disabled={saving}>
          {t('retry')}
        </button>
      </div>
    </form>
  );
}
