import { useAdminData } from '@/hooks/useAdminData';
import { GOVERNORATES } from '@/lib/adminGeo';
import { useI18n } from '@/i18n';

export function OverviewPage() {
  const { t } = useI18n();
  const { loading, error, stats, squads, registeredCount, unregistered, report, reload } =
    useAdminData();

  if (loading) return <p>{t('loadingData')}</p>;
  if (error) {
    return (
      <div>
        <div className="ac-error">{error}</div>
        <button type="button" className="ac-btn ac-btn-orange" onClick={reload}>
          {t('retry')}
        </button>
      </div>
    );
  }

  const totalSurveys = squads.reduce((a, s) => a + s.surveys, 0);
  const hitTarget = squads.filter((s) => s.surveys >= s.target).length;
  const travelEligible = squads.filter((s) => s.travelEligible).length;
  const maxSquads = stats?.maxSquads ?? 320;

  return (
    <>
      <div className="ac-grid ac-g4" style={{ marginBottom: 20 }}>
        <div className="ac-kpi">
          <div className="ac-v">
            {squads.length}{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--ac-gray-mid)', fontWeight: 600 }}>
              / {maxSquads}
            </span>
          </div>
          <div className="ac-l">{t('kpiSquadsFormed')}</div>
          <div className="ac-d">{t('kpiLiveData')}</div>
        </div>
        <div className="ac-kpi ac-k-green">
          <div className="ac-v">{registeredCount}</div>
          <div className="ac-l">{t('kpiRegistered')}</div>
          <div className="ac-d">
            {unregistered.length} {t('kpiNotRegistered')}
          </div>
        </div>
        <div className="ac-kpi ac-k-blue">
          <div className="ac-v">{report?.totalResponses ?? totalSurveys}</div>
          <div className="ac-l">{t('kpiSurveysCollected')}</div>
          <div className="ac-d">
            {hitTarget} {t('kpiHitTarget')}
          </div>
        </div>
        <div className="ac-kpi ac-k-purple">
          <div className="ac-v">{travelEligible}</div>
          <div className="ac-l">{t('kpiTravelEligible')}</div>
          <div className="ac-d">{t('kpiTravelRule')}</div>
        </div>
      </div>

      <div className="ac-grid ac-g2">
        <div className="ac-card">
          <h2>{t('surveyPaceTitle')}</h2>
          <p className="ac-sub">
            {t('surveyPaceSub')} ({squads[0]?.target ?? 40})
          </p>
          {squads.slice(0, 8).map((s) => (
            <div key={s.id} className="ac-progress-row">
              <span className="ac-progress-label">{s.name}</span>
              <div className="ac-bar" style={{ flex: 1 }}>
                <i style={{ width: `${Math.min(100, (s.surveys / s.target) * 100)}%` }} />
              </div>
              <span className="ac-progress-val">
                {s.surveys}/{s.target}
              </span>
            </div>
          ))}
          <p className="ac-hint">
            {t('surveyPaceHint')} {Math.min(8, squads.length)} / {squads.length}
          </p>
        </div>

        <div className="ac-card">
          <h2>{t('squadsByGovTitle')}</h2>
          <p className="ac-sub">{t('squadsByGovSub')}</p>
          {GOVERNORATES.map((g) => {
            const n = squads.filter((s) => s.destGov === g).length;
            if (!n) return null;
            return (
              <div key={g} className="ac-progress-row">
                <span style={{ width: 80, fontWeight: 600 }}>{g}</span>
                <div className="ac-bar" style={{ flex: 1 }}>
                  <i
                    style={{
                      width: `${(n / Math.max(squads.length, 1)) * 100}%`,
                      background: 'var(--ac-blue)',
                    }}
                  />
                </div>
                <span style={{ width: 30, textAlign: 'end', color: 'var(--ac-gray-mid)' }}>{n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
