import axios from 'axios';
import type { TranslationKey } from '@/i18n/en';

interface ApiErrorBody {
  code?: number | string;
  message?: string;
}

/** Internal app error codes (legacy / direct). */
const CODE_TO_KEY: Record<string, TranslationKey> = {
  AUTH_INVALID_DOMAIN: 'errorAuthInvalidDomain',
  AUTH_NOT_ELIGIBLE: 'errorAuthNotEligible',
  AUTH_INVALID_OTP: 'errorAuthInvalidOtp',
  AUTH_INVALID_CREDENTIALS: 'errorAuthInvalidCredentials',
  AUTH_SESSION_EXPIRED: 'errorAuthSessionExpired',
  AUTH_SESSION_INVALID: 'errorAuthSessionExpired',
  AUTH_INVALID_REFRESH_TOKEN: 'errorAuthSessionExpired',
  UNAUTHORIZED: 'errorUnauthorized',
  FORBIDDEN: 'errorForbidden',
  NOT_FOUND: 'errorNotFound',
  VALIDATION_FAILED: 'errorValidation',
  INTERNAL_ERROR: 'errorGeneric',
  BACKEND_UNAVAILABLE: 'errorBackendUnavailable',
  SQUAD_MEMBERSHIP_REQUIRED: 'errorForbidden',
};

/** Orange integer codes returned by backend (Apigee governance). */
const ORANGE_CODE_TO_KEY: Record<number, TranslationKey> = {
  1: 'errorGeneric',
  3: 'errorGeneric',
  5: 'errorBackendUnavailable',
  6: 'errorGeneric',
  22: 'errorValidation',
  40: 'errorUnauthorized',
  41: 'errorAuthInvalidCredentials',
  42: 'errorAuthSessionExpired',
  50: 'errorForbidden',
  51: 'errorForbidden',
  52: 'errorAuthNotEligible',
  60: 'errorNotFound',
  69: 'errorValidation',
};

function resolveErrorKey(code: number | string | undefined): TranslationKey | undefined {
  if (code === undefined || code === null) return undefined;
  if (typeof code === 'string') {
    return CODE_TO_KEY[code];
  }
  if (ORANGE_CODE_TO_KEY[code]) {
    return ORANGE_CODE_TO_KEY[code];
  }
  if (code >= 20 && code <= 28) return 'errorValidation';
  return undefined;
}

export function getApiErrorMessage(
  err: unknown,
  t: (key: TranslationKey) => string,
): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return t('errorNetwork');
    const status = err.response.status;
    const data = err.response.data as ApiErrorBody | undefined;
    const key = resolveErrorKey(data?.code);
    if (key) return t(key);
    if (status === 404 || (status >= 502 && status <= 504)) {
      return t('errorBackendUnavailable');
    }
    return t('errorGeneric');
  }
  return t('errorGeneric');
}

export function getAcceptLanguage(): string {
  const saved = localStorage.getItem('admin_locale');
  return saved === 'ar' ? 'ar' : 'en';
}
