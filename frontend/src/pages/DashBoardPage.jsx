import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Topbar from '../components/layout/Topbar';
import API from '../utils/api';

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change" style={{ color }}>{sub}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: '#94a3b8', fontSize: 12 }}>{label}</div>
      <div style={{ color: '#f59e0b', fontWeight: 700 }}>₹{Number(payload[0].value).toLocaleString('en-IN')}</div>
    </div>
  );
  return null;
};

const statusBadge = (s) => {
  const map = { Paid: 'badge-green', Unpaid: 'badge-red', Overdue: 'badge-orange', Partial: 'badge-yellow' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner"/><span>Loading dashboard...</span></div>;

  const stats = [
    { icon: '👥', label: 'Total Customers', value: data?.totalCustomers || 0, color: '#3b82f6', sub: `${data?.activeCustomers} active` },
    { icon: '💰', label: 'Revenue Collected', value: fmtCurrency(data?.totalRevenue), color: '#10b981', sub: '✓ Paid bills' },
    { icon: '⚠️', label: 'Pending Revenue', value: fmtCurrency(data?.pendingRevenue), color: '#f59e0b', sub: `${data?.unpaidBills} unpaid bills` },
    { icon: '🔴', label: 'Overdue Bills', value: data?.overdueB || 0, color: '#ef4444', sub: 'Needs attention' },
    { icon: '📊', label: 'Pending Readings', value: data?.pendingReadings || 0, color: '#8b5cf6', sub: 'Awaiting entry' },
    { icon: '🧾', label: 'Total Bills', value: data?.totalBills || 0, color: '#f97316', sub: 'All time' },
  ];

  const chartData = (data?.monthlyRevenue || []).map(d => ({ month: d._id, revenue: d.revenue, count: d.count }));

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Welcome back — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} />
      <div className="page-content">
        <div className="grid-3 mb-3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <div className="grid-2-1">
          {/* Revenue chart */}
          <div className="card">
            <div className="section-title">📈 Monthly Revenue (Paid)</div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.05)' }} />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No revenue data yet</div></div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card">
            <div className="section-title">⚡ Quick Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Collection Rate', value: data?.totalBills ? `${Math.round(((data.totalBills - data.unpaidBills) / data.totalBills) * 100)}%` : '—', color: '#10b981' },
                { label: 'Active Connections', value: data?.activeCustomers || 0, color: '#3b82f6' },
                { label: 'Overdue Amount', value: fmtCurrency(data?.pendingRevenue), color: '#ef4444' },
                { label: 'Avg Units / Customer', value: '—', color: '#8b5cf6' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #1e2d45' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{s.label}</span>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, color: s.color, fontSize: 15 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent bills */}
        <div className="card mt-3">
          <div className="section-title">🧾 Recent Bills</div>
          {data?.recentBills?.length > 0 ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Bill #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {data.recentBills.map(b => (
                    <tr key={b._id}>
                      <td><span className="font-mono text-accent">{b.billNumber}</span></td>
                      <td><div style={{ fontWeight: 600 }}>{b.customer?.name}</div><div style={{ fontSize: 11, color: '#64748b' }}>{b.customer?.customerId}</div></td>
                      <td style={{ fontWeight: 700, color: '#f59e0b' }}>{fmtCurrency(b.totalAmount)}</td>
                      <td>{statusBadge(b.paymentStatus)}</td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(b.billDate).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-icon">🧾</div><div className="empty-text">No bills yet</div></div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;