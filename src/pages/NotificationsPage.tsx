import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/api/errors';
import { notificationService, type NotificationAudience, type NotificationRecord } from '@/api/notification.service';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/useToast';
import { downloadCsv } from '@/lib/csvExport';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/en';

const AUDIENCES: NotificationAudience[] = [
  'All employees',
  'Squad leaders',
  'Travel-eligible squads',
  'Unregistered employees',
];

const TITLE_MAX = 80;
const MESSAGE_MAX = 500;
const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_MAX_EDGE = 1280;
const IMAGE_JPEG_QUALITY = 0.82;

type FieldKey = 'title' | 'body' | 'imageUrl';
type FieldErrors = Partial<Record<FieldKey, TranslationKey>>;

function formatSentTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function isPublicHttpsImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';
  } catch {
    return false;
  }
}

function validateNotificationFields(input: {
  title: string;
  body: string;
  imageUrl: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const title = input.title.trim();
  const body = input.body.trim();
  const imageUrl = input.imageUrl.trim();

  if (!title) errors.title = 'notifTitleRequired';
  else if (title.length > TITLE_MAX) errors.title = 'notifTitleTooLong';

  if (!body) errors.body = 'notifMessageRequired';
  else if (body.length > MESSAGE_MAX) errors.body = 'notifMessageTooLong';

  if (imageUrl && !imageUrl.startsWith('data:image') && !isPublicHttpsImageUrl(imageUrl)) {
    errors.imageUrl = 'notifImageUrlInvalid';
  }

  return errors;
}

function firstInvalidField(errors: FieldErrors): FieldKey | null {
  if (errors.title) return 'title';
  if (errors.body) return 'body';
  if (errors.imageUrl) return 'imageUrl';
  return null;
}

async function compressImageFile(file: File): Promise<string> {
  if (typeof createImageBitmap !== 'function') {
    return readFileAsDataUrl(file);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return readFileAsDataUrl(file);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

export function NotificationsPage() {
  const { t } = useI18n();
  const { logAction } = useAuditLog();
  const { showToast } = useToast();
  const [audience, setAudience] = useState<NotificationAudience>(AUDIENCES[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageUrlRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const items = await notificationService.history();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load notification history', err);
      showToast(t('notifHistoryLoadFailed'));
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const focusField = (field: FieldKey) => {
    const node = field === 'title' ? titleRef.current : field === 'body' ? bodyRef.current : imageUrlRef.current;
    node?.focus();
  };

  const applyValidation = (next = { title, body, imageUrl }) => {
    const errors = validateNotificationFields(next);
    setFieldErrors(errors);
    return errors;
  };

  const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: 'notifImageTypeInvalid' }));
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: 'notifImageTooLarge' }));
      return;
    }

    void compressImageFile(file)
      .then((dataUrl) => {
        setImageUrl(dataUrl);
        setImageFileName(file.name);
        setFieldErrors((prev) => ({ ...prev, imageUrl: undefined }));
      })
      .catch(() => {
        setFieldErrors((prev) => ({ ...prev, imageUrl: 'notifImageTypeInvalid' }));
      });
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    const errors = applyValidation();
    const invalid = firstInvalidField(errors);
    if (invalid) {
      focusField(invalid);
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
      setImageFileName('');
      setPreview(false);
      setFieldErrors({});
      showToast(`${t('notifSent')} — ${audience}`);
      await loadHistory();
    } catch (err) {
      console.error('Send notification failed', err);
      setFormError(getApiErrorMessage(err, t));
    } finally {
      setSending(false);
    }
  };

  const showPreview = () => {
    const errors = applyValidation();
    const invalid = firstInvalidField(errors);
    if (invalid) {
      setPreview(false);
      focusField(invalid);
      return;
    }
    setPreview(true);
  };

  const pastedImageUrl = imageUrl.startsWith('data:image') ? '' : imageUrl;

  return (
    <div className="ac-grid ac-g2">
      <div className="ac-card">
        <h2>{t('notifComposeTitle')}</h2>
        <p className="ac-sub">{t('notifComposeSub')}</p>
        {formError ? <div className="ac-error" role="alert">{formError}</div> : null}
        <form onSubmit={send} noValidate>
          <div className="ac-field">
            <label>{t('audience')}</label>
            <div className="ac-seg" role="group" aria-label={t('audience')}>
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
          <div className={`ac-field${fieldErrors.title ? ' is-invalid' : ''}`}>
            <label htmlFor="notif-title">
              {t('notifTitle')} <span className="ac-required">*</span>
            </label>
            <input
              ref={titleRef}
              id="notif-title"
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? 'notif-title-error' : 'notif-title-count'}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    title: validateNotificationFields({ title: e.target.value, body, imageUrl }).title,
                  }));
                }
              }}
              onBlur={() => {
                if (title.length > 0 || fieldErrors.title) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    title: validateNotificationFields({ title, body, imageUrl }).title,
                  }));
                }
              }}
              placeholder={t('notifTitlePlaceholder')}
            />
            <div className="ac-field-meta">
              {fieldErrors.title ? (
                <p id="notif-title-error" className="ac-field-error" role="alert">
                  {t(fieldErrors.title)}
                </p>
              ) : (
                <span />
              )}
              <span id="notif-title-count" className="ac-char-count">
                {t('notifCharCount')
                  .replace('{used}', String(title.trim().length))
                  .replace('{max}', String(TITLE_MAX))}
              </span>
            </div>
          </div>
          <div className={`ac-field${fieldErrors.body ? ' is-invalid' : ''}`}>
            <label htmlFor="notif-message">
              {t('notifMessage')} <span className="ac-required">*</span>
            </label>
            <textarea
              ref={bodyRef}
              id="notif-message"
              rows={4}
              value={body}
              maxLength={MESSAGE_MAX}
              aria-invalid={Boolean(fieldErrors.body)}
              aria-describedby={fieldErrors.body ? 'notif-message-error' : 'notif-message-count'}
              onChange={(e) => {
                setBody(e.target.value);
                if (fieldErrors.body) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    body: validateNotificationFields({ title, body: e.target.value, imageUrl }).body,
                  }));
                }
              }}
              onBlur={() => {
                if (body.length > 0 || fieldErrors.body) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    body: validateNotificationFields({ title, body, imageUrl }).body,
                  }));
                }
              }}
              placeholder={t('notifMessagePlaceholder')}
            />
            <div className="ac-field-meta">
              {fieldErrors.body ? (
                <p id="notif-message-error" className="ac-field-error" role="alert">
                  {t(fieldErrors.body)}
                </p>
              ) : (
                <span />
              )}
              <span id="notif-message-count" className="ac-char-count">
                {t('notifCharCount')
                  .replace('{used}', String(body.trim().length))
                  .replace('{max}', String(MESSAGE_MAX))}
              </span>
            </div>
          </div>
          <div className={`ac-field${fieldErrors.imageUrl ? ' is-invalid' : ''}`}>
            <label htmlFor="notif-image-file">{t('notifHeroImage')}</label>
            <input id="notif-image-file" type="file" accept="image/*" onChange={handleImageFile} />
            {imageFileName ? (
              <p className="ac-hint">{t('notifImageSelected').replace('{name}', imageFileName)}</p>
            ) : null}
            <input
              ref={imageUrlRef}
              id="notif-image-url"
              type="url"
              value={pastedImageUrl}
              aria-invalid={Boolean(fieldErrors.imageUrl)}
              aria-describedby={fieldErrors.imageUrl ? 'notif-image-error' : 'notif-image-hint'}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageFileName('');
                if (fieldErrors.imageUrl) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    imageUrl: validateNotificationFields({ title, body, imageUrl: e.target.value }).imageUrl,
                  }));
                }
              }}
              onBlur={() => {
                if (pastedImageUrl || fieldErrors.imageUrl) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    imageUrl: validateNotificationFields({ title, body, imageUrl }).imageUrl,
                  }));
                }
              }}
              placeholder={t('notifImageUrlPlaceholder')}
              style={{ marginTop: 8 }}
            />
            {fieldErrors.imageUrl ? (
              <p id="notif-image-error" className="ac-field-error" role="alert">
                {t(fieldErrors.imageUrl)}
              </p>
            ) : (
              <p id="notif-image-hint" className="ac-hint">{t('notifHeroImageHint')}</p>
            )}
          </div>
          <button type="submit" className="ac-btn ac-btn-orange" disabled={sending}>
            {sending ? t('loadingData') : t('sendNotification')}
          </button>
          <button
            type="button"
            className="ac-btn ac-btn-ghost"
            style={{ marginInlineStart: 8 }}
            onClick={showPreview}
          >
            {t('preview')}
          </button>
        </form>
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
            <b style={{ fontSize: '0.86rem' }}>{title.trim()}</b>
            <div style={{ fontSize: '0.82rem', color: 'var(--ac-gray-mid)' }}>{body.trim()}</div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                style={{ width: '100%', marginTop: 10, borderRadius: 10, maxHeight: 180, objectFit: 'cover' }}
              />
            ) : null}
          </div>
        )}
      </div>
      <div className="ac-card">
        <h2>{t('sentHistory')}</h2>
        <p className="ac-sub">{t('sentHistorySub')}</p>
        {loadingHistory ? (
          <p>{t('loadingData')}</p>
        ) : history.length === 0 ? (
          <p className="ac-hint">{t('notifHistoryEmpty')}</p>
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
