export type AppEnvironment = 'development' | 'demo' | 'uat' | 'preprod' | 'production';

interface EnvConfig {
  authApiUrl: string;
  userApiUrl: string;
  configApiUrl: string;
  surveyApiUrl: string;
  squadApiUrl: string;
  appEnv: AppEnvironment;
}

interface RuntimeConfig {
  VITE_API_URL?: string;
  VITE_APP_ENV?: string;
}

declare global {
  interface Window {
    __MYBOSS_RUNTIME__?: RuntimeConfig;
  }
}

function alignApiUrlToPageHost(apiUrl: string, appEnv: AppEnvironment): string {
  if (typeof window === 'undefined') return apiUrl;
  if (appEnv !== 'development' && appEnv !== 'demo') return apiUrl;
  try {
    const parsed = new URL(apiUrl);
    if (parsed.protocol === 'https:') return apiUrl;
    const pageHost = window.location.hostname;
    if (parsed.hostname !== pageHost) {
      parsed.hostname = pageHost;
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return apiUrl;
  }
}

function fromSingleOrigin(origin: string, appEnv: AppEnvironment): EnvConfig {
  const base = origin.replace(/\/$/, '');
  const apiUrl = alignApiUrlToPageHost(
    base.endsWith('/api/v1') ? base : `${base}/api/v1`,
    appEnv,
  );
  return {
    authApiUrl: apiUrl,
    userApiUrl: apiUrl,
    configApiUrl: apiUrl,
    surveyApiUrl: apiUrl,
    squadApiUrl: apiUrl,
    appEnv,
  };
}

function runtimeConfig(): RuntimeConfig {
  if (typeof window === 'undefined') return {};
  return window.__MYBOSS_RUNTIME__ ?? {};
}

function loadEnvConfig(): EnvConfig {
  const runtime = runtimeConfig();
  const gatewayOrigin = import.meta.env.VITE_API_GATEWAY_ORIGIN as string | undefined;
  const apiUrl =
    runtime.VITE_API_URL?.trim() ||
    (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const appEnv = (runtime.VITE_APP_ENV?.trim() ||
    (import.meta.env.VITE_APP_ENV as AppEnvironment) ||
    'development') as AppEnvironment;

  if (gatewayOrigin?.trim()) {
    return fromSingleOrigin(gatewayOrigin.trim(), appEnv);
  }
  if (apiUrl) {
    return fromSingleOrigin(apiUrl, appEnv);
  }

  const fallback = import.meta.env.VITE_AUTH_API_URL as string | undefined;
  if (fallback?.trim()) {
    return fromSingleOrigin(fallback.trim(), appEnv);
  }

  return fromSingleOrigin('http://127.0.0.1:3001/api/v1', appEnv);
}

export const env: EnvConfig = loadEnvConfig();
