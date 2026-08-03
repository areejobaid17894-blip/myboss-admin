import { useCallback, useEffect, useState } from 'react';
import { notificationService, type NotificationAudience, type NotificationRecord } from '@/api/notification.service';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';

const AUDIENCES: NotificationAudience[] = [
  'All employees',
  'Squad leaders',
  'Travel-eligible squads',
  'Unregistered employees',
];

function formatSentTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function NotificationsPage() {
  const { t } = useI18n();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [audience, setAudience] = useState<NotificationAudience>(AUDIENCES[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const items = await notificationService.history();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load notification history', err);
      showToast('Failed to load notification history');
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      showToast(t('notifMissingFields'));
      return;
    }
    setSending(true);
    try {
      await notificationService.create({
        title: title.trim(),
        body: body.trim(),
        audience,
        imageUrl: imageUrl.trim() || undefined,
      });
      logAction(`Pushed notification "${title.trim()}" to ${audience}.`);
      setTitle('');
      setBody('');
      setImageUrl('');
      setPreview(false);
      showToast(`${t('notifSent')} — ${audience}`);
      await loadHistory();
    } catch (err) {
      console.error('Send notification failed', err);
      showToast('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ac-grid ac-g2">
      <div className="ac-card">
        <h2>{t('notifComposeTitle')}</h2>
        <p className="ac-sub">{t('notifComposeSub')}</p>
        <div className="ac-field">
          <label>{t('audience')}</label>
          <div className="ac-seg">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                className={audience === a ? 'ac-on' : ''}
                onClick={() => setAudience(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="ac-field">
          <label>{t('notifTitle')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('notifTitlePlaceholder')}
          />
        </div>
        <div className="ac-field">
          <label>{t('notifMessage')}</label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('notifMessagePlaceholder')}
          />
        </div>
        <div className="ac-field">
          <label>Hero image URL (optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <button type="button" className="ac-btn ac-btn-orange" onClick={send} disabled={sending}>
          {sending ? t('loadingData') : t('sendNotification')}
        </button>
        <button
          type="button"
          className="ac-btn ac-btn-ghost"
          style={{ marginInlineStart: 8 }}
          onClick={() => setPreview(true)}
        >
          {t('preview')}
        </button>
        {preview && (
          <div
            style={{
              marginTop: 14,
              border: '1px solid var(--ac-gray-line)',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: 'var(--ac-orange)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                }}
              >
                B
              </span>
              <b style={{ fontSize: '0.8rem' }}>the Boss</b>
              <span style={{ fontSize: '0.7rem', color: 'var(--ac-gray-mid)' }}>{t('now')}</span>
            </div>
            <b style={{ fontSize: '0.86rem' }}>{title || t('notifTitlePlaceholder')}</b>
            <div style={{ fontSize: '0.82rem', color: 'var(--ac-gray-mid)' }}>
              {body || t('notifMessagePlaceholder')}
            </div>
          </div>
        )}
      </div>
      <div className="ac-card">
        <h2>{t('sentHistory')}</h2>
        <p className="ac-sub">{t('sentHistorySub')}</p>
        {loadingHistory ? (
          <p>{t('loadingData')}</p>
        ) : history.length === 0 ? (
          <p className="ac-hint">No notifications sent yet.</p>
        ) : (
          history.map((n) => (
            <div key={n.id} className="ac-notif-item">
              <div className="ac-notif-ic">🔔</div>
              <div>
                <b>{n.title}</b>{' '}
                <span className="ac-badge ac-b-orange" style={{ marginInlineStart: 6 }}>
                  {n.audience}
                </span>
                <div style={{ color: 'var(--ac-gray-mid)', marginTop: 2 }}>{n.body}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ac-gray-mid)', marginTop: 4 }}>
                  {formatSentTime(n.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
        <button
          type="button"
          className="ac-btn ac-btn-ghost ac-btn-sm"
          style={{ marginTop: 12 }}
          onClick={() =>
            downloadCsv(
              'notifications_history.csv',
              [
                ['Title', 'Message', 'Audience', 'Sent'],
                ...history.map((n) => [n.title, n.body, n.audience, formatSentTime(n.createdAt)]),
              ],
            )
          }
        >
          ⇩ {t('exportHistory')}
        </button>
      </div>
    </div>
  );
}
