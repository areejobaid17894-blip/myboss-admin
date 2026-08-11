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

function fromGatewayOrigin(gatewayOrigin: string, appEnv: AppEnvironment): EnvConfig {
  const base = gatewayOrigin.replace(/\/$/, '');
  return {
    authApiUrl: `${base}/auth/api/v1`,
    userApiUrl: `${base}/user/api/v1`,
    configApiUrl: `${base}/config/api/v1`,
    surveyApiUrl: `${base}/survey/api/v1`,
    squadApiUrl: `${base}/squad/api/v1`,
    appEnv,
  };
}

function loadEnvConfig(): EnvConfig {
  const gatewayOrigin = import.meta.env.VITE_API_GATEWAY_ORIGIN as string | undefined;
  const appEnv = (import.meta.env.VITE_APP_ENV as AppEnvironment) || 'development';

  if (gatewayOrigin?.trim()) {
    return fromGatewayOrigin(gatewayOrigin.trim(), appEnv);
  }

  return {
    authApiUrl: requireEnv('VITE_AUTH_API_URL'),
    userApiUrl: requireEnv('VITE_USER_API_URL'),
    configApiUrl: requireEnv('VITE_CONFIG_API_URL'),
    surveyApiUrl: requireEnv('VITE_SURVEY_API_URL'),
    squadApiUrl: requireEnv('VITE_SQUAD_API_URL'),
    appEnv,
  };
}

export const env: EnvConfig = loadEnvConfig();
