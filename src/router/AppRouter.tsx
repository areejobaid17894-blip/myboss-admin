import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { SquadsPage } from '@/pages/SquadsPage';
import { DestinationsPage } from '@/pages/DestinationsPage';
import { UnregisteredPage } from '@/pages/UnregisteredPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ExtractionPage } from '@/pages/ExtractionPage';
import { PhotosPage } from '@/pages/PhotosPage';
import { VestsPage } from '@/pages/VestsPage';
import { AuditPage } from '@/pages/AuditPage';
import { ConfigurationPage } from '@/pages/ConfigurationPage';
import { UsersPage } from '@/pages/UsersPage';
import { SurveysPage } from '@/pages/SurveysPage';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout />;
}

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="squads" element={<SquadsPage />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="unregistered" element={<UnregisteredPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="extraction" element={<ExtractionPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="vests" element={<VestsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="configuration" element={<ConfigurationPage />} />
          <Route path="users" element={<Navigate to="/unregistered" replace />} />
          <Route path="analytics" element={<Navigate to="/statistics" replace />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
