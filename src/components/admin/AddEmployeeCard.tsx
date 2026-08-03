import { FormEvent, useState } from 'react';
import { authService } from '@/api/auth.service';
import { getApiErrorMessage } from '@/api/errors';
import { userService } from '@/api/user.service';
import { DEMO_EMPLOYEE_EMAIL } from '@/config/demo';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';

const EMPTY = { firstName: '', lastName: '', email: '', role: 'employee' };
const EMAIL_DOMAIN = DEMO_EMPLOYEE_EMAIL.split('@')[1] ?? 'orange.com';

export function AddEmployeeCard({ onCreated }: { onCreated?: () => void }) {
  const { t } = useI18n();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => setForm(EMPTY);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const email = form.email.trim().toLowerCase();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();

    try {
      const { data: user } = await userService.create({
        firstName,
        lastName,
        email,
        role: form.role,
      });

      await authService.registerEligibleParticipant({
        email,
        firstName,
        lastName,
        userId: user.id,
      });

      logAction(`Added employee ${firstName} ${lastName} (${email}).`);
      showToast(t('userCreatedSuccess'));
      resetForm();
      onCreated?.();
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ac-card ac-add-user-card">
      <h2>{t('addUserTitle')}</h2>
      <p className="ac-sub">{t('addUserSubtitle')}</p>
      {error && <div className="ac-error">{error}</div>}
      <form onSubmit={handleCreate} className="ac-add-user-form">
        <div className="ac-grid ac-g2">
          <div className="ac-field">
            <label htmlFor="add-user-first-name">{t('firstName')}</label>
            <input
              id="add-user-first-name"
              type="text"
              className="ac-input"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder={t('addUserFirstNamePlaceholder')}
              required
              disabled={saving}
            />
          </div>
          <div className="ac-field">
            <label htmlFor="add-user-last-name">{t('lastName')}</label>
            <input
              id="add-user-last-name"
              type="text"
              className="ac-input"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              placeholder={t('addUserLastNamePlaceholder')}
              required
              disabled={saving}
            />
          </div>
        </div>
        <div className="ac-field">
          <label htmlFor="add-user-email">{t('email')}</label>
          <input
            id="add-user-email"
            type="email"
            className="ac-input"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={`name.surname@${EMAIL_DOMAIN}`}
            required
            disabled={saving}
          />
          <p className="ac-hint">{t('addUserEmailHint')}</p>
        </div>
        <div className="ac-field">
          <label htmlFor="add-user-role">{t('role')}</label>
          <select
            id="add-user-role"
            className="ac-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={saving}
          >
            <option value="employee">{t('roleEmployee')}</option>
            <option value="admin">{t('roleAdmin')}</option>
          </select>
          <p className="ac-hint">{t('addUserRoleHint')}</p>
        </div>
        <div className="ac-toolbar ac-add-user-actions">
          <button type="submit" className="ac-btn ac-btn-orange" disabled={saving}>
            {saving ? t('pleaseWait') : t('addUser')}
          </button>
          <button type="button" className="ac-btn ac-btn-ghost" disabled={saving} onClick={resetForm}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
