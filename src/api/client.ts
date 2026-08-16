import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getAcceptLanguage } from '@/api/errors';
import { tryRefreshAccessToken } from '@/auth/refreshAccessToken';
import { clearTokens, getAccessToken } from '@/auth/tokenStorage';
import { env } from '@/config/env';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const AUTH_ROUTES_WITHOUT_REFRESH = [
  '/auth/admin-sign-in',
  '/auth/verify-2fa',
  '/auth/resend-otp',
  '/auth/refresh',
  '/auth/sign-out',
];

function shouldSkipRefresh(url: string | undefined): boolean {
  if (!url) return true;
  return AUTH_ROUTES_WITHOUT_REFRESH.some((route) => url.includes(route));
}

function redirectToLogin(): void {
  clearTokens();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 60_000,
    maxBodyLength: 8 * 1024 * 1024,
    maxContentLength: 8 * 1024 * 1024,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['Accept-Language'] = getAcceptLanguage();
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const config = error.config as RetryableRequestConfig | undefined;
      const requestUrl = config?.url ?? '';

      if (shouldSkipRefresh(requestUrl) || config?._retry) {
        if (!shouldSkipRefresh(requestUrl)) {
          redirectToLogin();
        }
        return Promise.reject(error);
      }

      const refreshed = await tryRefreshAccessToken();
      if (refreshed && config) {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config._retry = true;
        try {
          return await client.request(config);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }

      redirectToLogin();
      return Promise.reject(error);
    },
  );

  return client;
}

export const authApi = createApiClient(env.authApiUrl);
export const userApi = createApiClient(env.userApiUrl);
export const configApi = createApiClient(env.configApiUrl);
export const surveyApi = createApiClient(env.surveyApiUrl);
export const squadApi = createApiClient(env.squadApiUrl);
