import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { section: 'My Account' },
  { to: '/customer/dashboard', icon: '🏠', label: 'My Dashboard' },
  { to: '/customer/bills',     icon: '🧾', label: 'My Bills' },
  { to: '/customer/readings',  icon: '📊', label: 'My Readings' },
  { to: '/customer/profile',   icon: '👤', label: 'My Profile' },
];

const CustomerSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <div>
          <div className="logo-text">PowerBill</div>
          <div className="logo-sub">Customer Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section-label">{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">Customer</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>🚪 Sign Out</button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;