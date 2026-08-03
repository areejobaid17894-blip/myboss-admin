import { useAuditLog } from '@/hooks/useAuditLog';
import { useI18n } from '@/i18n';

export function AuditPage() {
  const { t } = useI18n();
  const { entries } = useAuditLog();

  return (
    <div className="ac-card">
      <h2>{t('auditTitle')}</h2>
      <p className="ac-sub">{t('auditSub')}</p>
      {entries.length === 0 ? (
        <p className="ac-hint">{t('auditEmpty')}</p>
      ) : (
        entries.map((a, i) => (
          <div key={`${a.time}-${i}`} className="ac-audit-row">
            <span className="ac-audit-time">{a.time}</span>
            <span>{a.action}</span>
          </div>
        ))
      )}
    </div>
  );
}
