import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/api/auth.service';
import { useAuth } from '@/auth/AuthContext';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';
import { DEMO_ADMIN_EMAIL } from '@/config/demo';
import styles from './AdminLayout.module.css';

const NAV_SECTIONS = [
  {
    labelKey: 'navMonitor',
    items: [
      { to: '/', end: true, key: 'navOverview', icon: '◧' },
      { to: '/statistics', key: 'navStatistics', icon: '◔' },
      { to: '/squads', key: 'navSquads', icon: '⛨' },
    ],
  },
  {
    labelKey: 'navOperations',
    items: [
      { to: '/destinations', key: 'navDestinations', icon: '➤' },
      { to: '/users', key: 'navUsers', icon: '👤' },
      { to: '/unregistered', key: 'navUnregistered', icon: '⚠' },
      { to: '/notifications', key: 'navNotifications', icon: '🔔' },
    ],
  },
  {
    labelKey: 'navData',
    items: [
      { to: '/extraction', key: 'navExtraction', icon: '⇩' },
      { to: '/surveys', key: 'navSurveys', icon: '✎' },
      { to: '/photos', key: 'navPhotos', icon: '▣' },
      { to: '/vests', key: 'navVests', icon: '▲' },
    ],
  },
  {
    labelKey: 'navSystem',
    items: [
      { to: '/configuration', key: 'navConfiguration', icon: '⚙' },
      { to: '/audit', key: 'navAudit', icon: '≡' },
    ],
  },
] as const;

const PAGE_META: Record<string, { titleKey: TranslationKey; crumbKey: TranslationKey }> = {
  '/': { titleKey: 'navOverview', crumbKey: 'crumbOverview' },
  '/statistics': { titleKey: 'navStatistics', crumbKey: 'crumbStatistics' },
  '/squads': { titleKey: 'navSquads', crumbKey: 'crumbSquads' },
  '/destinations': { titleKey: 'navDestinations', crumbKey: 'crumbDestinations' },
  '/users': { titleKey: 'navUsers', crumbKey: 'crumbUsers' },
  '/unregistered': { titleKey: 'navUnregistered', crumbKey: 'crumbUnregistered' },
  '/notifications': { titleKey: 'navNotifications', crumbKey: 'crumbNotifications' },
  '/extraction': { titleKey: 'navExtraction', crumbKey: 'crumbExtraction' },
  '/surveys': { titleKey: 'navSurveys', crumbKey: 'crumbSurveys' },
  '/photos': { titleKey: 'navPhotos', crumbKey: 'crumbPhotos' },
  '/vests': { titleKey: 'navVests', crumbKey: 'crumbVests' },
  '/audit': { titleKey: 'navAudit', crumbKey: 'crumbAudit' },
  '/configuration': { titleKey: 'navConfiguration', crumbKey: 'crumbConfiguration' },
};

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t, toggleLocale, locale, dir } = useI18n();

  const meta = PAGE_META[location.pathname] ?? PAGE_META['/'];

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={styles.layout} dir={dir}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.wordmark}>
            the <span>Boss</span>
          </div>
          <div className={styles.eyebrow}>{t('adminConsole')}</div>
        </div>
        <nav className={styles.nav}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.labelKey}>
              <div className={styles.navLabel}>{t(section.labelKey)}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {t(item.key)}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <b>{t('initiativeTitle')}</b>
          {t('initiativeTagline')}
        </div>
      </aside>
      <div className={styles.mainWrap}>
        <header className={styles.topbar}>
          <div>
            <h1>{t(meta.titleKey)}</h1>
            <div className={styles.crumb}>
              {t('adminConsole')} · {t(meta.crumbKey)}
            </div>
          </div>
          <div className={styles.spacer} />
          <button type="button" className={styles.topBtn} onClick={toggleLocale}>
            {locale === 'en' ? 'ع' : 'EN'}
          </button>
          <button type="button" className={styles.topBtn} onClick={handleSignOut}>
            {t('signOut')}
          </button>
          <div className={styles.adminChip}>
            <span className={styles.avatar}>A</span>
            {DEMO_ADMIN_EMAIL}
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
