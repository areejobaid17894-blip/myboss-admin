import { useCallback, useRef, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/auth.service';
import { getApiErrorMessage } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { OtpInput } from '@/components/OtpInput';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/config/demo';
import { env } from '@/config/env';
import { useI18n } from '@/i18n';
import styles from './LoginPage.module.css';

type LoginStep = 'credentials' | 'otp';

const isDemoBuild = env.appEnv === 'demo';

function parseAdminSignInResponse(data: unknown) {
  if (!data || typeof data !== 'object') return null;
  const body = data as Record<string, unknown>;
  return {
    requiresTwoFactor: Boolean(body.requiresTwoFactor),
    sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
    demoOtpCode: typeof body.demoOtpCode === 'string' ? body.demoOtpCode : undefined,
    accessToken: typeof body.accessToken === 'string' ? body.accessToken : undefined,
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, toggleLocale, locale, dir } = useI18n();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState(isDemoBuild ? DEMO_ADMIN_EMAIL : '');
  const [password, setPassword] = useState(isDemoBuild ? DEMO_ADMIN_PASSWORD : '');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState<string | undefined>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef('');

  const goToOtpStep = (nextSessionId: string, nextDemoOtp?: string) => {
    sessionIdRef.current = nextSessionId;
    setSessionId(nextSessionId);
    setDemoOtpCode(nextDemoOtp);
    setOtp('');
    setError('');
    setStep('otp');
  };

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.adminSignIn({
        email: email.trim().toLowerCase(),
        password,
      });
      const data = parseAdminSignInResponse(response.data);

      if (!data) {
        setError(t('errorGeneric'));
        return;
      }

      if (data.requiresTwoFactor && data.sessionId) {
        goToOtpStep(data.sessionId, isDemoBuild ? data.demoOtpCode : undefined);
        return;
      }

      if (data.accessToken) {
        setError(t('adminOtpRequiredHint'));
        return;
      }

      setError(t('errorGeneric'));
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = useCallback(
    async (code: string) => {
      const activeSessionId = sessionIdRef.current || sessionId;
      if (code.length !== 6 || !activeSessionId) return;

      setLoading(true);
      setError('');

      try {
        const { data } = await authService.verifyOtp({ sessionId: activeSessionId, code });
        login(data.accessToken);
        navigate('/', { replace: true });
      } catch (err) {
        setError(getApiErrorMessage(err, t));
        setOtp('');
      } finally {
        setLoading(false);
      }
    },
    [login, navigate, sessionId, t],
  );

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await verifyOtp(otp);
  };

  const handleResend = async () => {
    const activeSessionId = sessionIdRef.current || sessionId;
    if (!activeSessionId) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await authService.resendOtp(activeSessionId);
      setDemoOtpCode(isDemoBuild ? data.demoOtpCode : undefined);
      setOtp('');
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  const backToCredentials = () => {
    sessionIdRef.current = '';
    setStep('credentials');
    setSessionId('');
    setOtp('');
    setDemoOtpCode(undefined);
    setError('');
  };

  return (
    <div className={styles.container} dir={dir}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h1 className={styles.wordmark}>
            the <span>Boss</span>
          </h1>
          <div className={styles.eyebrow}>{t('adminConsole')}</div>
        </div>
        <div className={styles.sideFoot}>
          <b>{t('initiativeTitle')}</b>
          {t('initiativeTagline')}
        </div>
      </aside>
      <div className={styles.main}>
        <button type="button" className={styles.langToggle} onClick={toggleLocale}>
          {locale === 'en' ? 'العربية' : 'English'}
        </button>
        <form
          className={styles.form}
          onSubmit={step === 'credentials' ? handleCredentialsSubmit : handleOtpSubmit}
        >
          <p className={styles.subtitle}>
            {step === 'credentials' ? t('adminSignInTitle') : t('otpPrompt')}
          </p>

          {error && <div className={styles.error}>{error}</div>}

          {step === 'credentials' ? (
            <>
              <div className={styles.field}>
                <label>{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={DEMO_ADMIN_EMAIL}
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
              <div className={styles.field}>
                <label>{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              <div className={styles.demoHint}>{t('adminDemoHint')}</div>
              <div className={styles.demoHint} style={{ marginTop: 8 }}>
                {t('testAccountsMobileHint')}
              </div>
              <button type="submit" className={styles.primaryButton} disabled={loading}>
                {loading ? t('pleaseWait') : t('sendOtp')}
              </button>
            </>
          ) : (
            <>
              <p className={styles.otpEmail}>{email}</p>
              <div className={styles.otpField}>
                <span className={styles.otpLabel}>{t('otpCode')}</span>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  onComplete={verifyOtp}
                  disabled={loading}
                  autoFillCode={demoOtpCode}
                  submitOnAutoFill={isDemoBuild}
                />
              </div>
              {isDemoBuild && demoOtpCode && (
                <div className={styles.demoHint}>
                  {t('adminOtpDemoHint')}: {demoOtpCode}
                </div>
              )}
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading || otp.length !== 6}
              >
                {loading ? t('pleaseWait') : t('verifyOtp')}
              </button>
              <button type="button" className={styles.linkButton} onClick={handleResend} disabled={loading}>
                {t('resendOtp')}
              </button>
              <button
                type="button"
                className={styles.linkButton}
                onClick={backToCredentials}
                disabled={loading}
              >
                {t('useDifferentEmail')}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
