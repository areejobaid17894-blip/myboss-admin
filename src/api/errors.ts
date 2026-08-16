import axios from 'axios';
import type { TranslationKey } from '@/i18n/en';

interface ApiErrorBody {
  code?: number | string;
  reason?: string;
  message?: string;
  internalCode?: string;
}

export type ApiErrorContext = 'otp' | 'credentials' | 'generic';

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
  SQUAD_NAME_TAKEN: 'errorSquadNameTaken',
  VALIDATION_FAILED: 'errorValidation',
  INTERNAL_ERROR: 'errorGeneric',
  BACKEND_UNAVAILABLE: 'errorBackendUnavailable',
  SQUAD_MEMBERSHIP_REQUIRED: 'errorForbidden',
};

/**
 * Orange integer codes (Apigee governance).
 * Note: code 41 is shared by invalid OTP and invalid password — use context / message.
 */
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

function looksLikeOtpFailure(data: ApiErrorBody | undefined): boolean {
  const text = `${data?.reason ?? ''} ${data?.message ?? ''}`.toLowerCase();
  return (
    text.includes('otp') ||
    text.includes('verification code') ||
    text.includes('رمز التحقق')
  );
}

function resolveErrorKey(
  code: number | string | undefined,
  data: ApiErrorBody | undefined,
  context: ApiErrorContext,
): TranslationKey | undefined {
  if (code === undefined || code === null) return undefined;
  if (typeof code === 'string') {
    return CODE_TO_KEY[code];
  }
  // Orange 41 = invalid credentials OR invalid OTP — disambiguate
  if (code === 41) {
    if (context === 'otp' || looksLikeOtpFailure(data)) {
      return 'errorAuthInvalidOtp';
    }
    if (context === 'credentials') {
      return 'errorAuthInvalidCredentials';
    }
    if (looksLikeOtpFailure(data)) return 'errorAuthInvalidOtp';
    return 'errorAuthInvalidCredentials';
  }
  // Orange 69 = several conflicts; prefer backend localized message when present.
  if (code === 69) {
    return undefined;
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
  context: ApiErrorContext = 'generic',
): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return t('errorNetwork');
    const status = err.response.status;
    const data = err.response.data as ApiErrorBody | undefined;

    if (typeof data?.internalCode === 'string' && CODE_TO_KEY[data.internalCode]) {
      return t(CODE_TO_KEY[data.internalCode]);
    }

    // UI step context wins for shared Orange code 41 (OTP vs password)
    if (context === 'otp' && (data?.code === 41 || data?.code === 'AUTH_INVALID_OTP')) {
      return t('errorAuthInvalidOtp');
    }
    if (context === 'credentials' && (data?.code === 41 || data?.code === 'AUTH_INVALID_CREDENTIALS')) {
      return t('errorAuthInvalidCredentials');
    }

    const key = resolveErrorKey(data?.code, data, context);
    if (key) return t(key);

    // Backend already localizes `message` (Accept-Language) — use when code is unknown
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }

    if (status === 413) {
      return t('errorImageTooLarge');
    }
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
