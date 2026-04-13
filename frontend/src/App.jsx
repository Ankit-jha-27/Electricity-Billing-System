import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import './index.css';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ReadingsPage from './pages/ReadingsPage';
import BillsPage from './pages/BillsPage';
import TariffsPage from './pages/TariffsPage';
import ReportsPage from './pages/ReportsPage';

// Only logged-in users can access this route
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Logged-in users are redirected away from auth pages
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <div className="main-content">{children}</div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

      
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected app pages */}
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
      <Route path="/customers" element={<PrivateRoute><AppLayout><CustomersPage /></AppLayout></PrivateRoute>} />
      <Route path="/readings"  element={<PrivateRoute><AppLayout><ReadingsPage /></AppLayout></PrivateRoute>} />
      <Route path="/bills"     element={<PrivateRoute><AppLayout><BillsPage /></AppLayout></PrivateRoute>} />
      <Route path="/tariffs"   element={<PrivateRoute><AppLayout><TariffsPage /></AppLayout></PrivateRoute>} />
      <Route path="/reports"   element={<PrivateRoute><AppLayout><ReportsPage /></AppLayout></PrivateRoute>} />

      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111827', color: '#e2e8f0', border: '1px solid #1e2d45' },
            success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}