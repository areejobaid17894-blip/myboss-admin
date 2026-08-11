import { GOVERNORATES } from '@/lib/adminGeo';
import { useI18n } from '@/i18n';
import type { UserListFilters } from '@/api/user.service';

interface UserListFiltersProps {
  filters: UserListFilters;
  onChange: (patch: Partial<UserListFilters>) => void;
  onClear: () => void;
  showRoleFilter?: boolean;
  showOnboardingFilter?: boolean;
  showSquadFilter?: boolean;
}

export function UserListFiltersBar({
  filters,
  onChange,
  onClear,
  showRoleFilter = true,
  showOnboardingFilter = true,
  showSquadFilter = true,
}: UserListFiltersProps) {
  const { t } = useI18n();

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.id ||
      filters.email ||
      (showRoleFilter && filters.role) ||
      (showOnboardingFilter && filters.onboardingCompleted !== undefined) ||
      filters.governorate ||
      (showSquadFilter && filters.hasSquad !== undefined),
  );

  return (
    <div className="ac-filter-bar">
      <div className="ac-filter-grid">
        <label className="ac-filter-field">
          <span>{t('filterSearch')}</span>
          <input
            type="search"
            value={filters.search ?? ''}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder={t('filterSearchPlaceholder')}
          />
        </label>
        <label className="ac-filter-field">
          <span>{t('userId')}</span>
          <input
            type="search"
            value={filters.id ?? ''}
            onChange={(e) => onChange({ id: e.target.value })}
            placeholder={t('filterIdPlaceholder')}
          />
        </label>
        <label className="ac-filter-field">
          <span>{t('email')}</span>
          <input
            type="search"
            value={filters.email ?? ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder={t('filterEmailPlaceholder')}
          />
        </label>
        {showRoleFilter && (
          <label className="ac-filter-field">
            <span>{t('role')}</span>
            <select
              value={filters.role ?? ''}
              onChange={(e) => onChange({ role: e.target.value || undefined })}
            >
              <option value="">{t('filterAllRoles')}</option>
              <option value="employee">{t('roleEmployee')}</option>
              <option value="admin">{t('roleAdmin')}</option>
            </select>
          </label>
        )}
        {showOnboardingFilter && (
          <label className="ac-filter-field">
            <span>{t('filterRegistration')}</span>
            <select
              value={
                filters.onboardingCompleted === undefined
                  ? ''
                  : filters.onboardingCompleted
                    ? 'registered'
                    : 'unregistered'
              }
              onChange={(e) => {
                const value = e.target.value;
                onChange({
                  onboardingCompleted:
                    value === '' ? undefined : value === 'registered',
                });
              }}
            >
              <option value="">{t('filterAllRegistration')}</option>
              <option value="registered">{t('registered')}</option>
              <option value="unregistered">{t('unregistered')}</option>
            </select>
          </label>
        )}
        <label className="ac-filter-field">
          <span>{t('governorate')}</span>
          <select
            value={filters.governorate ?? ''}
            onChange={(e) => onChange({ governorate: e.target.value || undefined })}
          >
            <option value="">{t('filterAllGovernorates')}</option>
            {GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </label>
        {showSquadFilter && (
          <label className="ac-filter-field">
            <span>{t('filterSquadAssignment')}</span>
            <select
              value={
                filters.hasSquad === undefined ? '' : filters.hasSquad ? 'assigned' : 'unassigned'
              }
              onChange={(e) => {
                const value = e.target.value;
                onChange({
                  hasSquad: value === '' ? undefined : value === 'assigned',
                });
              }}
            >
              <option value="">{t('filterAllSquadStatus')}</option>
              <option value="assigned">{t('filterHasSquad')}</option>
              <option value="unassigned">{t('filterNoSquad')}</option>
            </select>
          </label>
        )}
      </div>
      {hasActiveFilters && (
        <div className="ac-filter-actions">
          <button type="button" className="ac-btn ac-btn-outline ac-btn-sm" onClick={onClear}>
            {t('clearFilters')}
          </button>
        </div>
      )}
    </div>
  );
}
