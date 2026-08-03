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

export const env: EnvConfig = {
  authApiUrl: requireEnv('VITE_AUTH_API_URL'),
  userApiUrl: requireEnv('VITE_USER_API_URL'),
  configApiUrl: requireEnv('VITE_CONFIG_API_URL'),
  surveyApiUrl: requireEnv('VITE_SURVEY_API_URL'),
  squadApiUrl: requireEnv('VITE_SQUAD_API_URL'),
  appEnv: (import.meta.env.VITE_APP_ENV as AppEnvironment) || 'development',
};
