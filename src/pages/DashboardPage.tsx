import { useI18n } from '@/i18n';
import styles from './AdminPage.module.css';

export function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('dashboard')}</h1>
          <p>{t('dashboardSubtitle')}</p>
        </div>
      </header>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.cardAccent}`}>
          <div className={styles.stat}>5</div>
          <h2>{t('dashboardServices')}</h2>
          <p>{t('dashboardServicesDesc')}</p>
        </article>
        <article className={styles.card}>
          <h2>{t('surveys')}</h2>
          <p>{t('dashboardSurveysDesc')}</p>
        </article>
        <article className={styles.card}>
          <h2>{t('users')}</h2>
          <p>{t('dashboardUsersDesc')}</p>
        </article>
        <article className={styles.card}>
          <h2>{t('configuration')}</h2>
          <p>{t('dashboardConfigDesc')}</p>
        </article>
        <article className={styles.card}>
          <h2>{t('analytics')}</h2>
          <p>{t('dashboardAnalyticsDesc')}</p>
        </article>
      </div>
    </div>
  );
}
