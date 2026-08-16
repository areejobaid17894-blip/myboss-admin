export type AppEnvironment = 'development' | 'demo' | 'uat' | 'production';

interface EnvConfig {
  authApiUrl: string;
  userApiUrl: string;
  configApiUrl: string;
  surveyApiUrl: string;
  squadApiUrl: string;
  appEnv: AppEnvironment;
}

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value as string;
}

function alignApiUrlToPageHost(apiUrl: string, appEnv: AppEnvironment): string {
  if (typeof window === 'undefined') return apiUrl;
  if (appEnv !== 'development' && appEnv !== 'demo') return apiUrl;
  try {
    const parsed = new URL(apiUrl);
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

function loadEnvConfig(): EnvConfig {
  const gatewayOrigin = import.meta.env.VITE_API_GATEWAY_ORIGIN as string | undefined;
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const appEnv = (import.meta.env.VITE_APP_ENV as AppEnvironment) || 'development';

  if (gatewayOrigin?.trim()) {
    return fromSingleOrigin(gatewayOrigin.trim(), appEnv);
  }
  if (apiUrl?.trim()) {
    return fromSingleOrigin(apiUrl.trim(), appEnv);
  }

  const fallback = requireEnv('VITE_AUTH_API_URL');
  return fromSingleOrigin(fallback, appEnv);
}

export const env: EnvConfig = loadEnvConfig();
