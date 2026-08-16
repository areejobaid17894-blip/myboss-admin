import { FormEvent, useCallback, useEffect, useState } from 'react';
import { configService, type EmployeeSettings } from '@/api/config.service';
import { getApiErrorMessage } from '@/api/errors';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';

type NumericSettingKey =
  | 'maxUsersPerSquad'
  | 'maxSquads'
  | 'surveyTargetPerSquad'
  | 'eventDurationHours'
  | 'profileEditLimit'
  | 'galleryUploadLimit';

export interface SettingsFieldDef {
  key: NumericSettingKey;
  labelKey: TranslationKey;
  hintKey: TranslationKey;
  min?: number;
}

interface EmployeeSettingsCardProps {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  fields: SettingsFieldDef[];
  /** Called after a successful save so parent pages can refresh. */
  onSaved?: (settings: EmployeeSettings) => void;
}

const FIELD_DEFAULTS: Record<NumericSettingKey, number> = {
  maxUsersPerSquad: 5,
  maxSquads: 320,
  surveyTargetPerSquad: 50,
  eventDurationHours: 8,
  profileEditLimit: 3,
  galleryUploadLimit: 20,
};

export function EmployeeSettingsCard({ titleKey, descKey, fields, onSaved }: EmployeeSettingsCardProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<NumericSettingKey, number>>({ ...FIELD_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await configService.getEmployeeSettings();
      setValues((prev) => {
        const next = { ...prev };
        for (const field of fields) {
          const raw = data[field.key];
          next[field.key] = typeof raw === 'number' && Number.isFinite(raw) ? raw : FIELD_DEFAULTS[field.key];
        }
        return next;
      });
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [fields, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (key: NumericSettingKey, value: string) => {
    const parsed = Number.parseInt(value, 10);
    setValues((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload: Partial<EmployeeSettings> = {};
      for (const field of fields) {
        payload[field.key] = values[field.key];
      }
      const { data } = await configService.updateEmployeeSettings(payload);
      setValues((prev) => {
        const next = { ...prev };
        for (const field of fields) {
          const raw = data[field.key];
          next[field.key] = typeof raw === 'number' && Number.isFinite(raw) ? raw : prev[field.key];
        }
        return next;
      });
      setSuccess(t('configSavedSuccess'));
      onSaved?.(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ac-card">
        <p>{t('loadingConfig')}</p>
      </div>
    );
  }

  return (
    <form className="ac-card" onSubmit={handleSubmit}>
      <h2>{t(titleKey)}</h2>
      <p className="ac-sub">{t(descKey)}</p>
      {error && <div className="ac-error">{error}</div>}
      {success && (
        <div className="ac-ai-note" style={{ background: 'var(--ac-green-soft)', color: '#2b8a5c' }}>
          {success}
        </div>
      )}
      <div className="ac-grid ac-g2">
        {fields.map(({ key, labelKey, hintKey, min = 0 }) => (
          <div key={key} className="ac-field">
            <label htmlFor={`settings-${titleKey}-${key}`}>{t(labelKey)}</label>
            <input
              id={`settings-${titleKey}-${key}`}
              type="number"
              className="ac-input"
              min={min}
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              disabled={saving}
            />
            <p className="ac-hint">{t(hintKey)}</p>
          </div>
        ))}
      </div>
      <div className="ac-toolbar">
        <button type="submit" className="ac-btn ac-btn-orange" disabled={saving}>
          {saving ? t('pleaseWait') : t('saveConfig')}
        </button>
        <button type="button" className="ac-btn ac-btn-ghost" onClick={load} disabled={saving}>
          {t('retry')}
        </button>
      </div>
    </form>
  );
}

export const SQUAD_SETTINGS_FIELDS: SettingsFieldDef[] = [
  { key: 'maxUsersPerSquad', labelKey: 'configMaxMembers', hintKey: 'configMaxMembersHint', min: 1 },
  { key: 'maxSquads', labelKey: 'configMaxSquads', hintKey: 'configMaxSquadsHint', min: 1 },
];

export const SURVEY_SETTINGS_FIELDS: SettingsFieldDef[] = [
  { key: 'surveyTargetPerSquad', labelKey: 'configSurveyTarget', hintKey: 'configSurveyTargetHint', min: 1 },
  { key: 'eventDurationHours', labelKey: 'configEventDuration', hintKey: 'configEventDurationHint', min: 1 },
];

export const GALLERY_SETTINGS_FIELDS: SettingsFieldDef[] = [
  { key: 'galleryUploadLimit', labelKey: 'configGalleryLimit', hintKey: 'configGalleryLimitHint', min: 1 },
];

export const PROFILE_SETTINGS_FIELDS: SettingsFieldDef[] = [
  { key: 'profileEditLimit', labelKey: 'configProfileEditLimit', hintKey: 'configProfileEditLimitHint', min: 0 },
];
