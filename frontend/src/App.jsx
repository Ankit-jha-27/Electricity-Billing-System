import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import CustomerSidebar from './components/layout/CustomerSidebar';
import './index.css';

// Public pages
import LandingPage  from './pages/LandingPage';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin pages
import AdminDashboard     from './pages/admin/DashBoardPage';
import CustomersPage      from './pages/admin/CustomersPage';
import ReadingsPage       from './pages/admin/ReadingsPage';
import BillsPage          from './pages/admin/BillsPage';
import TariffsPage        from './pages/admin/TariffsPage';
import ReportsPage        from './pages/admin/ReportsPage';
import RegistrationsPage  from './pages/admin/RegistrationsPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBills     from './pages/customer/CustomerBills';
import CustomerReadings  from './pages/customer/CustomerReadings';
import CustomerProfile   from './pages/customer/CustomerProfile';

// ── Route guards ──────────────────────────────────────────────

// Redirect unauthenticated users to /login
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Admin/operator only — customers get bounced to their own dashboard
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
  return children;
};

// Customer only — admins get bounced to admin dashboard
const CustomerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'customer') return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirect already-logged-in users away from auth pages
const GuestRoute = ({ children }) => {
  const { user, getDashboardPath } = useAuth();
  return user ? <Navigate to={getDashboardPath(user.role)} replace /> : children;
};

// Layouts

const AdminLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <div className="main-content">{children}</div>
  </div>
);

const CustomerLayout = ({ children }) => (
  <div className="layout">
    <CustomerSidebar />
    <div className="main-content">{children}</div>
  </div>
);

// Routes 

const AppRoutes = () => {
  const { user, getDashboardPath } = useAuth();

  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LandingPage />} />

      {/* Auth — guests only */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* ── Admin / Operator routes ── */}
      <Route path="/dashboard"     element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/registrations" element={<AdminRoute><AdminLayout><RegistrationsPage /></AdminLayout></AdminRoute>} />
      <Route path="/customers"     element={<AdminRoute><AdminLayout><CustomersPage /></AdminLayout></AdminRoute>} />
      <Route path="/readings"      element={<AdminRoute><AdminLayout><ReadingsPage /></AdminLayout></AdminRoute>} />
      <Route path="/bills"         element={<AdminRoute><AdminLayout><BillsPage /></AdminLayout></AdminRoute>} />
      <Route path="/tariffs"       element={<AdminRoute><AdminLayout><TariffsPage /></AdminLayout></AdminRoute>} />
      <Route path="/reports"       element={<AdminRoute><AdminLayout><ReportsPage /></AdminLayout></AdminRoute>} />

      {/* ── Customer routes ── */}
      <Route path="/customer/dashboard" element={<CustomerRoute><CustomerLayout><CustomerDashboard /></CustomerLayout></CustomerRoute>} />
      <Route path="/customer/bills"     element={<CustomerRoute><CustomerLayout><CustomerBills /></CustomerLayout></CustomerRoute>} />
      <Route path="/customer/readings"  element={<CustomerRoute><CustomerLayout><CustomerReadings /></CustomerLayout></CustomerRoute>} />
      <Route path="/customer/profile"   element={<CustomerRoute><CustomerLayout><CustomerProfile /></CustomerLayout></CustomerRoute>} />

      {/* Fallback */}
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
            error:   { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
