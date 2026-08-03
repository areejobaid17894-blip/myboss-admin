import { useCallback, useEffect, useState } from 'react';
import {
  analyticsService,
  type AnalyticsDataset,
  type AnalyticsSeriesPoint,
} from '@/api/analytics.service';
import { getApiErrorMessage } from '@/api/errors';
import { surveyService, type CompanyReport } from '@/api/survey.service';
import { useI18n } from '@/i18n';
import styles from './AnalyticsPage.module.css';

export function AnalyticsPage() {
  const { t } = useI18n();
  const [datasets, setDatasets] = useState<AnalyticsDataset[]>([]);
  const [series, setSeries] = useState<AnalyticsSeriesPoint[]>([]);
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [datasetsRes, seriesRes, companyReport] = await Promise.all([
        analyticsService.listDatasets(),
        analyticsService.getSeries(),
        surveyService.getCompanyReport(),
      ]);
      setDatasets(datasetsRes.data.datasets);
      setSeries(seriesRes.data.series);
      setReport(companyReport);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const download = async (datasetId: string, format: 'csv' | 'json') => {
    setExporting(`${datasetId}-${format}`);
    setError('');
    try {
      await analyticsService.downloadExport(datasetId, format);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setExporting('');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('analyticsTitle')}</h1>
          <p>{t('analyticsSubtitle')}</p>
        </div>
        <button type="button" onClick={load} disabled={loading}>
          {t('retry')}
        </button>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.card}>
        <h2>{t('reportsSummaryTitle')}</h2>
        {loading ? (
          <p>{t('loadingAnalytics')}</p>
        ) : report ? (
          <>
            <div className={styles.summaryGrid}>
              <article className={styles.summaryStat}>
                <span className={styles.statValue}>{report.totalResponses}</span>
                <span className={styles.statLabel}>{t('reportsTotalResponses')}</span>
              </article>
              <article className={styles.summaryStat}>
                <span className={styles.statValue}>{report.avgSatisfaction}</span>
                <span className={styles.statLabel}>{t('reportsAvgSatisfaction')}</span>
              </article>
              <article className={styles.summaryStat}>
                <span className={styles.statValue}>{report.surveysPerHour}</span>
                <span className={styles.statLabel}>{t('reportsSurveysPerHour')}</span>
              </article>
            </div>
            <h3 className={styles.subheading}>{t('reportsTopPriorities')}</h3>
            {report.topPriorities.length === 0 ? (
              <p className={styles.lead}>{t('reportsNoPriorities')}</p>
            ) : (
              <ul className={styles.priorityList}>
                {report.topPriorities.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <span>{item.count} ({item.percentage}%)</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </section>

      <section className={styles.card}>
        <h2>{t('analyticsPowerBiTitle')}</h2>
        <p>{t('analyticsPowerBiDesc')}</p>
        <ol className={styles.steps}>
          <li>{t('analyticsPowerBiStep1')}</li>
          <li>{t('analyticsPowerBiStep2')}</li>
          <li>{t('analyticsPowerBiStep3')}</li>
        </ol>
      </section>

      <section className={styles.card}>
        <h2>{t('analyticsDatasetsTitle')}</h2>
        {loading ? (
          <p>{t('loadingAnalytics')}</p>
        ) : (
          <div className={styles.datasetGrid}>
            {datasets.map((dataset) => (
              <article key={dataset.id} className={styles.datasetCard}>
                <h3>{dataset.name}</h3>
                <p>{dataset.description}</p>
                <div className={styles.meta}>
                  <span>{dataset.rowCount} {t('analyticsRows')}</span>
                  <span>{dataset.columns.length} {t('analyticsColumns')}</span>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => download(dataset.id, 'csv')}
                    disabled={exporting === `${dataset.id}-csv`}
                  >
                    {exporting === `${dataset.id}-csv` ? t('pleaseWait') : t('exportCsv')}
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => download(dataset.id, 'json')}
                    disabled={exporting === `${dataset.id}-json`}
                  >
                    {exporting === `${dataset.id}-json` ? t('pleaseWait') : t('exportJson')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>{t('analyticsSeriesTitle')}</h2>
        <p className={styles.lead}>{t('analyticsSeriesDesc')}</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('analyticsPeriod')}</th>
                <th>{t('analyticsSegment')}</th>
                <th>{t('analyticsGovernorate')}</th>
                <th>{t('analyticsResponseCount')}</th>
                <th>{t('analyticsAvgSatisfaction')}</th>
                <th>{t('analyticsAvgNps')}</th>
              </tr>
            </thead>
            <tbody>
              {series.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>{t('analyticsSeriesEmpty')}</td>
                </tr>
              ) : (
                series.map((row) => (
                  <tr key={`${row.period}-${row.segment}-${row.governorate}`}>
                    <td>{row.period}</td>
                    <td>{row.segment}</td>
                    <td>{row.governorate}</td>
                    <td>{row.responseCount}</td>
                    <td>{row.avgSatisfaction}</td>
                    <td>{row.avgNps}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
