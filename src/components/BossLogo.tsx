import styles from './BossLogo.module.css';
import { useI18n } from '@/i18n';

interface BossLogoProps {
  showTagline?: boolean;
  showAdminBadge?: boolean;
  adminBadgeLabel?: string;
  variant?: 'default' | 'light' | 'compact';
}

export function BossLogo({
  showTagline = false,
  showAdminBadge = false,
  adminBadgeLabel = 'Admin',
  variant = 'default',
}: BossLogoProps) {
  const { dir } = useI18n();

  const className = [
    styles.logo,
    variant === 'light' ? styles.light : '',
    variant === 'compact' ? styles.compact : '',
    dir === 'rtl' ? styles.rtl : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <h1 className={styles.wordmark}>
        <span className={styles.the}>the </span>
        <span className={styles.boss}>BOSS</span>
      </h1>
      {showTagline && <p className={styles.tagline}>Bring our squads to society.</p>}
      {showAdminBadge && <span className={styles.adminBadge}>{adminBadgeLabel}</span>}
    </div>
  );
}
