import {
  EmployeeSettingsCard,
  GALLERY_SETTINGS_FIELDS,
  PROFILE_SETTINGS_FIELDS,
  SQUAD_SETTINGS_FIELDS,
  SURVEY_SETTINGS_FIELDS,
} from '@/components/admin/EmployeeSettingsCard';
import { SquadJoinDeadlineCard } from '@/components/admin/SquadJoinDeadlineCard';
import { useI18n } from '@/i18n';
import { Link } from 'react-router-dom';

export function ConfigurationPage() {
  const { t } = useI18n();

  return (
    <div className="ac-grid" style={{ gap: 16 }}>
      <div className="ac-card">
        <h2>{t('configHubTitle')}</h2>
        <p className="ac-sub">{t('configHubDesc')}</p>
        <div className="ac-grid ac-g2" style={{ gap: 12 }}>
          <Link className="ac-ex-card" to="/squads">
            <b>{t('configSectionSquad')}</b>
            <div className="ac-ex-desc">{t('configSectionSquadDesc')}</div>
          </Link>
          <Link className="ac-ex-card" to="/surveys">
            <b>{t('configSectionSurvey')}</b>
            <div className="ac-ex-desc">{t('configSectionSurveyDesc')}</div>
          </Link>
          <Link className="ac-ex-card" to="/photos">
            <b>{t('configSectionGallery')}</b>
            <div className="ac-ex-desc">{t('configSectionGalleryDesc')}</div>
          </Link>
          <Link className="ac-ex-card" to="/vests">
            <b>{t('configSectionVest')}</b>
            <div className="ac-ex-desc">{t('configSectionVestDesc')}</div>
          </Link>
          <Link className="ac-ex-card" to="/users">
            <b>{t('configSectionProfile')}</b>
            <div className="ac-ex-desc">{t('configSectionProfileDesc')}</div>
          </Link>
        </div>
      </div>

      <EmployeeSettingsCard
        titleKey="configSectionSquad"
        descKey="configSectionSquadDesc"
        fields={SQUAD_SETTINGS_FIELDS}
      />
      <SquadJoinDeadlineCard />
      <EmployeeSettingsCard
        titleKey="configSectionSurvey"
        descKey="configSectionSurveyDesc"
        fields={SURVEY_SETTINGS_FIELDS}
      />
      <EmployeeSettingsCard
        titleKey="configSectionGallery"
        descKey="configSectionGalleryDesc"
        fields={GALLERY_SETTINGS_FIELDS}
      />
      <EmployeeSettingsCard
        titleKey="configSectionProfile"
        descKey="configSectionProfileDesc"
        fields={PROFILE_SETTINGS_FIELDS}
      />

      <div className="ac-card">
        <h2>{t('configReferenceTitle')}</h2>
        <p className="ac-sub">{t('configPowerBiNote')}</p>
        <div className="ac-grid" style={{ gap: 12 }}>
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
