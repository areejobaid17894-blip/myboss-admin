/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GATEWAY_ORIGIN?: string;
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_USER_API_URL?: string;
  readonly VITE_CONFIG_API_URL?: string;
  readonly VITE_SURVEY_API_URL?: string;
  readonly VITE_SQUAD_API_URL?: string;
  readonly VITE_APP_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
