import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/auth/AuthContext';
import { ToastProvider } from '@/hooks/useToast';
import { I18nProvider } from '@/i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRouter } from '@/router/AppRouter';
import '@/index.css';
import '@/styles/admin-console.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
