import { FormEvent, useCallback, useEffect, useState } from 'react';
import { configService, type EmployeeSettings } from '@/api/config.service';
import { getApiErrorMessage } from '@/api/errors';
import { useI18n } from '@/i18n';

const EMPTY: EmployeeSettings = {
  maxUsersPerSquad: 5,
  maxSquads: 320,
  surveyTargetPerSquad: 50,
  eventDurationHours: 8,
  profileEditLimit: 2,
  galleryUploadLimit: 20,
  vestSizeEditWindowStart: '',
  vestSizeEditWindowEnd: '',
};

export function ConfigurationPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<EmployeeSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await configService.getEmployeeSettings();
      setSettings(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (key: keyof EmployeeSettings, value: string) => {
    const parsed = Number.parseInt(value, 10);
    setSettings((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { maxUsersPerSquad, maxSquads, surveyTargetPerSquad, eventDurationHours, profileEditLimit, galleryUploadLimit } =
        settings;
      const { data } = await configService.updateEmployeeSettings({
        maxUsersPerSquad,
        maxSquads,
        surveyTargetPerSquad,
        eventDurationHours,
        profileEditLimit,
        galleryUploadLimit,
      });
      setSettings(data);
      setSuccess(t('configSavedSuccess'));
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof EmployeeSettings; label: string; hint: string }[] = [
    { key: 'maxUsersPerSquad', label: t('configMaxMembers'), hint: t('configMaxMembersHint') },
    { key: 'maxSquads', label: t('configMaxSquads'), hint: t('configMaxSquadsHint') },
    { key: 'surveyTargetPerSquad', label: t('configSurveyTarget'), hint: t('configSurveyTargetHint') },
    { key: 'eventDurationHours', label: t('configEventDuration'), hint: t('configEventDurationHint') },
    { key: 'profileEditLimit', label: t('configProfileEditLimit'), hint: t('configProfileEditLimitHint') },
    { key: 'galleryUploadLimit', label: t('configGalleryLimit'), hint: t('configGalleryLimitHint') },
  ];

  if (loading) return <p>{t('loadingConfig')}</p>;

  return (
    <div className="ac-grid ac-g2">
      <form className="ac-card" onSubmit={handleSubmit}>
        <h2>{t('configEmployeeSettings')}</h2>
        <p className="ac-sub">{t('configEmployeeSettingsDesc')}</p>
        {error && <div className="ac-error">{error}</div>}
        {success && (
          <div className="ac-ai-note" style={{ background: 'var(--ac-green-soft)', color: '#2b8a5c' }}>
            {success}
          </div>
        )}
        <div className="ac-grid ac-g2">
          {fields.map(({ key, label, hint }) => (
            <div key={key} className="ac-field">
              <label htmlFor={`config-${key}`}>{label}</label>
              <input
                id={`config-${key}`}
                type="number"
                className="ac-input"
                min={0}
                value={settings[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={saving}
              />
              <p className="ac-hint">{hint}</p>
            </div>
          ))}
        </div>
        <div className="ac-toolbar">
          <button type="submit" className="ac-btn ac-btn-orange" disabled={saving}>
            {saving ? t('pleaseWait') : t('saveConfig')}
          </button>
          <button type="button" className="ac-btn ac-btn-ghost" onClick={loadSettings} disabled={saving}>
            {t('retry')}
          </button>
        </div>
      </form>
      <div className="ac-card">
        <h2>{t('configReferenceTitle')}</h2>
        <p className="ac-sub">{t('configPowerBiNote')}</p>
        <div className="ac-grid" style={{ gap: 12 }}>
          <div className="ac-ex-card">
            <b>{t('configSquadLimits')}</b>
            <div className="ac-ex-desc">{t('configSquadLimitsDesc')}</div>
          </div>
          <div className="ac-ex-card">
            <b>{t('configBuildings')}</b>
            <div className="ac-ex-desc">{t('configBuildingsDesc')}</div>
          </div>
          <div className="ac-ex-card">
            <b>{t('configSegments')}</b>
            <div className="ac-ex-desc">{t('configSegmentsDesc')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
