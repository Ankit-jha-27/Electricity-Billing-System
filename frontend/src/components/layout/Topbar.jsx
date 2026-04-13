import React from 'react';

const Topbar = ({ title, subtitle, actions }) => (
  <div className="topbar">
    <div>
      <div className="topbar-title">{title}</div>
      {subtitle && <div className="topbar-sub">{subtitle}</div>}
    </div>
    {actions && <div className="topbar-right">{actions}</div>}
  </div>
);

export default Topbar;