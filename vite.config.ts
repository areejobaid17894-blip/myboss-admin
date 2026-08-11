import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    env: {
      VITE_AUTH_API_URL: 'http://localhost:3001/api/v1',
      VITE_USER_API_URL: 'http://localhost:3002/api/v1',
      VITE_CONFIG_API_URL: 'http://localhost:3003/api/v1',
      VITE_SURVEY_API_URL: 'http://localhost:3005/api/v1',
      VITE_SQUAD_API_URL: 'http://localhost:3004/api/v1',
      VITE_APP_ENV: 'development',
    },
  },
});
