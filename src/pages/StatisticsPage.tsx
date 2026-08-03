import { useAdminData } from '@/hooks/useAdminData';
import { DonutChart, HBarChart, StatCard } from '@/components/admin/AdminCharts';
import { GOVERNORATES, VEST_SIZES } from '@/lib/adminGeo';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';

export function StatisticsPage() {
  const { t } = useI18n();
  const { loading, error, squads, members, report, gallery, unregistered, reload } = useAdminData();

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

  const totalSurveys = report?.totalResponses ?? squads.reduce((a, s) => a + s.surveys, 0);
  const sat = [
    { label: t('satVery'), value: Math.round(totalSurveys * 0.34), color: 'var(--ac-green)' },
    { label: t('satSatisfied'), value: Math.round(totalSurveys * 0.41), color: 'var(--ac-blue)' },
    { label: t('satNeutral'), value: Math.round(totalSurveys * 0.15), color: 'var(--ac-yellow)' },
    { label: t('satDissatisfied'), value: Math.round(totalSurveys * 0.07), color: 'var(--ac-orange)' },
    { label: t('satVeryDissatisfied'), value: Math.round(totalSurveys * 0.03), color: 'var(--ac-pink)' },
  ];
  const positive = totalSurveys
    ? Math.round(((sat[0].value + sat[1].value) / totalSurveys) * 100)
    : 0;

  const themes =
    report?.topPriorities?.map((p) => ({ label: p.label, value: p.count })) ??
    [
      { label: 'Network quality', value: Math.round(totalSurveys * 0.31) },
      { label: 'Pricing & offers', value: Math.round(totalSurveys * 0.24) },
      { label: 'Customer service', value: Math.round(totalSurveys * 0.18) },
    ];

  const hit = squads.filter((s) => s.surveys >= s.target).length;
  const close = squads.filter((s) => s.surveys < s.target && s.surveys >= s.target * 0.75).length;
  const behind = squads.length - hit - close;

  const svByGov = GOVERNORATES.map((g) => ({
    label: g,
    value: squads.filter((s) => s.destGov === g).reduce((a, s) => a + s.surveys, 0),
  }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const vestCols: Record<string, string> = {
    XS: 'var(--ac-pink)',
    S: 'var(--ac-yellow)',
    M: 'var(--ac-orange)',
    L: 'var(--ac-green)',
    XL: 'var(--ac-blue)',
    XXL: 'var(--ac-purple)',
  };
  const vestSegs = VEST_SIZES.map((v) => ({
    label: v,
    value: members.filter((m) => m.vest === v).length,
    color: vestCols[v],
  }));

  const willingSq = squads.filter((s) => s.travelWilling >= 3).length;
  const willingMem = members.filter((m) => m.travel).length;
  const fillRows = [5, 4, 3, 2, 1].map((n) => ({
    label: `${n}/5 ${t('members')}`,
    value: squads.filter((s) => s.members.length === n).length,
    color: n === 5 ? 'var(--ac-green)' : n >= 3 ? 'var(--ac-yellow)' : 'var(--ac-orange)',
  }));

  const photos = gallery.filter((g) => g.type === 'image').length;
  const videos = gallery.length - photos;
  const mediaGov = GOVERNORATES.map((g) => ({
    label: g,
    value: gallery.filter((p) => p.governorate === g).length,
  }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const consented = Math.round(totalSurveys * 0.8);

  const exportPace = () =>
    downloadCsv(
      'survey_pace.csv',
      [
        ['Squad ID', 'Squad', 'Surveys', 'Target', '% of target', 'Hit target'],
        ...squads.map((s) => [
          s.squadCode,
          s.name,
          s.surveys,
          s.target,
          `${Math.round((s.surveys / s.target) * 100)}%`,
          s.surveys >= s.target ? 'Yes' : 'No',
        ]),
      ],
    );

  return (
    <>
      <div className="ac-grid ac-g2" style={{ marginBottom: 20 }}>
        <StatCard
          title={t('statSurveyResults')}
          desc={`${t('statSurveyResultsDesc')} (${totalSurveys})`}
          onExport={() =>
            downloadCsv(
              'surveys_dataset.csv',
              [['Squad', 'Surveys'], ...squads.map((s) => [s.name, s.surveys])],
            )
          }
        >
          <DonutChart segments={sat} centerTop={`${positive}%`} centerSub={t('positive')} />
        </StatCard>
        <StatCard title={t('statThemes')} desc={t('statThemesDesc')}>
          <HBarChart rows={themes} color="var(--ac-blue)" />
        </StatCard>
        <StatCard title={t('statTarget')} desc={`${t('statTargetDesc')} (${squads[0]?.target ?? 40})`} onExport={exportPace}>
          <DonutChart
            segments={[
              { label: t('hitTarget'), value: hit, color: 'var(--ac-green)' },
              { label: t('closeTarget'), value: close, color: 'var(--ac-yellow)' },
              { label: t('behindTarget'), value: behind, color: 'var(--ac-orange)' },
            ]}
            centerTop={String(hit)}
            centerSub={`${t('of')} ${squads.length}`}
          />
        </StatCard>
        <StatCard title={t('statByGov')} desc={t('statByGovDesc')}>
          <HBarChart rows={svByGov} />
        </StatCard>
        <StatCard
          title={t('statVestDist')}
          desc={t('statVestDistDesc')}
          onExport={() =>
            downloadCsv(
              'vest_sizes_totals.csv',
              [['Size', 'Count'], ...VEST_SIZES.map((v) => [v, members.filter((m) => m.vest === v).length])],
            )
          }
        >
          <DonutChart segments={vestSegs} centerTop={String(members.length)} centerSub={t('members')} />
        </StatCard>
        <StatCard title={t('statTravel')} desc={t('statTravelDesc')}>
          <DonutChart
            segments={[
              { label: t('squadsWilling'), value: willingSq, color: 'var(--ac-green)' },
              { label: t('baseOnly'), value: squads.length - willingSq, color: 'var(--ac-gray-mid)' },
            ]}
            centerTop={members.length ? `${Math.round((willingMem / members.length) * 100)}%` : '0%'}
            centerSub={t('membersWilling')}
          />
        </StatCard>
        <StatCard title={t('statRegistration')} desc={t('statRegistrationDesc')}>
          <DonutChart
            segments={[
              { label: t('registered'), value: members.length, color: 'var(--ac-green)' },
              { label: t('unregistered'), value: unregistered.length, color: 'var(--ac-orange)' },
            ]}
            centerTop={String(members.length + unregistered.length)}
            centerSub={t('employees')}
          />
        </StatCard>
        <StatCard title={t('statFill')} desc={t('statFillDesc')}>
          <HBarChart rows={fillRows} />
        </StatCard>
        <StatCard title={t('statMedia')} desc={t('statMediaDesc')}>
          <DonutChart
            segments={[
              { label: t('photos'), value: photos, color: 'var(--ac-blue)' },
              { label: t('videos'), value: videos, color: 'var(--ac-purple)' },
            ]}
            centerTop={String(gallery.length)}
            centerSub={t('files')}
          />
          {mediaGov.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <HBarChart rows={mediaGov} color="var(--ac-blue)" />
            </div>
          )}
        </StatCard>
        <StatCard title={t('statConsent')} desc={t('statConsentDesc')}>
          <DonutChart
            segments={[
              { label: t('consented'), value: consented, color: 'var(--ac-green)' },
              { label: t('anonymous'), value: totalSurveys - consented, color: 'var(--ac-gray-mid)' },
            ]}
            centerTop={totalSurveys ? `${Math.round((consented / totalSurveys) * 100)}%` : '0%'}
            centerSub={t('consentRate')}
          />
        </StatCard>
      </div>
      <p className="ac-hint">{t('statIllustrativeHint')}</p>
    </>
  );
}
