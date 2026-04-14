import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // Poll pending registrations count every 30s so badge stays fresh
  useEffect(() => {
    const fetchCount = () => {
      API.get('/registrations?status=pending')
        .then(r => setPendingCount(r.data.pendingCount || 0))
        .catch(() => {});
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    { section: 'Overview' },
    { to: '/dashboard',     icon: '⚡', label: 'Dashboard' },
    { section: 'Management' },
    { to: '/registrations', icon: '📝', label: 'Registrations', badge: pendingCount || null },
    { to: '/customers',     icon: '👥', label: 'Customers' },
    { to: '/readings',      icon: '📊', label: 'Meter Readings' },
    { to: '/bills',         icon: '🧾', label: 'Bills' },
    { section: 'Configuration' },
    { to: '/tariffs',       icon: '💡', label: 'Tariff Management' },
    { section: 'Reports' },
    { to: '/reports',       icon: '📋', label: 'Reports & Export' },
  ];

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
          <div className="logo-sub">Electricity Billing System</div>
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
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>🚪 Sign Out</button>
      </div>
    </aside>
  );
};

export default Sidebar;