import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getAcceptLanguage } from '@/api/errors';
import { env } from '@/config/env';

function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 30_000,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['Accept-Language'] = getAcceptLanguage();
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('access_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
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
