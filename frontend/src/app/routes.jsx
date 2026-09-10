import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import { PrivateRoute, AdminPrivateRoute } from './guards/PrivateRoute';
import Login from '../pages/auth/Login';
import Overview from '../pages/overview/Overview';
import DriversPage from '../pages/drivers/DriversPage';
import ArchivedDriversPage from '../pages/drivers/ArchivedDriversPage';
import VehiclesPage from '../pages/vehicles/VehiclePage';
import ArchivedVehiclesPage from '../pages/vehicles/ArchivedVehiclesPage';
import MaintenancesPage from '../pages/maintenances/MaintenancesPage';
import ViolationsPage from '../pages/violations/ViolationsPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminLogsPage from '../pages/admin/AdminLogsPage';
import NotFoundPage from '../pages/errors/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="drivers/archived" element={<ArchivedDriversPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="vehicles/archived" element={<ArchivedVehiclesPage />} />
        <Route path="reports" element={<DocumentsPage />} />
        <Route path="maintenance" element={<MaintenancesPage />} />
        <Route path="violations" element={<ViolationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin" element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
        <Route path="*" element={<NotFoundPage homeTo="/admin/users" homeLabel="กลับหน้าจัดการผู้ใช้งาน" />} />
      </Route>
    </Routes>
  );
}