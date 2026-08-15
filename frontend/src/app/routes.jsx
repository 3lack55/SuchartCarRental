import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { PrivateRoute } from './guards/PrivateRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Overview from '../pages/overview/Overview';
import DriversPage from '../pages/drivers/DriversPage';
import VehiclesPage from '../pages/vehicles/VehiclePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="reports" element={<h1>Reports</h1>} />
        <Route path="maintenance" element={<h1>Maintenance</h1>} />
        <Route path="violations" element={<h1>Violations</h1>} />
      </Route>
    </Routes>
  );
}