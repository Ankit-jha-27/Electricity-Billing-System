import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const statusBadge = (s) => {
  const map = { Paid: 'badge-green', Unpaid: 'badge-red', Overdue: 'badge-orange', Partial: 'badge-yellow' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const connStatusBadge = (s) => {
  const map = { Active: 'badge-green', Inactive: 'badge-gray', Suspended: 'badge-yellow', Disconnected: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: '#94a3b8', fontSize: 12 }}>{label}</div>
      <div style={{ color: '#10b981', fontWeight: 700 }}>{payload[0].value} kWh</div>
    </div>
  );
  return null;
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // If the user has no linked Customer record yet, their application is pending
  const isPending = !user?.customerId;

  const fetchData = useCallback(() => {
    if (isPending) { setLoading(false); return; }
    API.get('/customer/me')
      .then(r => setData(r.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load your data'))
      .finally(() => setLoading(false));
  }, [isPending]);

  useEffect(() => {
    fetchData();
    // Listen for payment events fired by CustomerBills after a successful pay
    window.addEventListener('bill-paid', fetchData);
    return () => window.removeEventListener('bill-paid', fetchData);
  }, [fetchData]);

  // ── Pending approval screen ───────────────────────────────────
  if (isPending) return (
    <>
      <Topbar title="My Dashboard" subtitle="Customer Portal" />
      <div className="page-content">
        <div style={{
          maxWidth: 560,
          margin: '40px auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
        }}>
          {/* Animated clock icon */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(245,158,11,0.12)',
            border: '2px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 36,
          }}>
            ⏳
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
            Application Under Review
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Your connection request has been submitted successfully. Our team is reviewing your application and will assign a meter number and activate your connection shortly.
          </p>

          {/* Steps */}
          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            {[
              { icon: '✅', label: 'Application submitted',         done: true  },
              { icon: '🔍', label: 'Admin review in progress',      done: false, active: true },
              { icon: '⚡', label: 'Meter assigned & connection activated', done: false },
              { icon: '🧾', label: 'Start receiving bills',         done: false },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                background: step.active ? 'rgba(245,158,11,0.08)' : step.done ? 'rgba(16,185,129,0.06)' : 'transparent',
                border: step.active ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  background: step.done ? 'var(--green-dim)' : step.active ? 'rgba(245,158,11,0.15)' : 'var(--bg)',
                  border: `1px solid ${step.done ? 'var(--green)' : step.active ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                  {step.done ? '✓' : step.active ? '●' : String(i + 1)}
                </div>
                <span style={{
                  fontSize: 13,
                  fontWeight: step.active ? 700 : 500,
                  color: step.done ? 'var(--green)' : step.active ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            📧 You're registered as <strong style={{ color: 'var(--text)' }}>{user?.email}</strong>.
            Once activated, this dashboard will automatically show your meter readings, bills, and payment history.
          </div>
        </div>
      </div>
    </>
  );

  if (loading) return (
    <div className="loading-state">
      <div className="spinner" />
      <span>Loading your dashboard...</span>
    </div>
  );

  if (error) return (
    <div style={{ padding: 32 }}>
      <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 20, color: 'var(--red)' }}>
        ⚠️ {error}
      </div>
    </div>
  );

  const { customer, bills, readings, stats } = data;

  // Build consumption chart from readings
  const chartData = [...readings].reverse().map(r => ({
    month: r.readingMonth,
    units: r.unitsConsumed,
  }));

  const latestBill = bills[0];

  return (
    <>
      <Topbar
        title={`Welcome, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Your electricity account at a glance"
      />
      <div className="page-content">

        {/* Connection status banner */}
        {customer.connectionStatus !== 'Active' && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>Connection {customer.connectionStatus}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {customer.connectionStatus === 'Inactive'
                  ? 'Your connection is pending activation by the utility board. You will be notified once active.'
                  : 'Please contact the utility office to resolve your connection status.'}
              </div>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid-4 mb-3">
          {[
            {
              icon: '💰',
              label: 'Outstanding Balance',
              value: fmtCurrency(stats.outstandingBalance),
              color: stats.outstandingBalance > 0 ? '#ef4444' : '#10b981',
              sub: stats.outstandingBalance > 0 ? 'Please pay soon' : 'All clear!',
            },
            {
              icon: '🧾',
              label: 'Unpaid Bills',
              value: stats.unpaidBills,
              color: stats.unpaidBills > 0 ? '#f97316' : '#10b981',
              sub: stats.unpaidBills > 0 ? 'Needs attention' : 'All paid',
            },
            {
              icon: '⚡',
              label: 'Units This Month',
              value: `${stats.unitsThisMonth} kWh`,
              color: '#3b82f6',
              sub: 'Current reading cycle',
            },
            {
              icon: '✅',
              label: 'Total Paid',
              value: fmtCurrency(stats.totalPaid),
              color: '#10b981',
              sub: 'All time',
            },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
              <div>
                <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: 11, color: s.color, marginTop: 4 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2-1">
          {/* Consumption chart */}
          <div className="card">
            <div className="section-title">📈 Unit Consumption History</div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="unitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit=" kWh" width={55} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2} fill="url(#unitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No readings recorded yet</div></div>
            )}
          </div>

          {/* Connection details */}
          <div className="card">
            <div className="section-title">🔌 Connection Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Customer ID',  value: customer.customerId },
                { label: 'Meter Number', value: customer.meterNumber, highlight: true },
                { label: 'Connection',   value: customer.connectionType },
                { label: 'Status',       value: connStatusBadge(customer.connectionStatus), isJSX: true },
                { label: 'Sanctioned Load', value: `${customer.sanctionedLoad || 0} kW` },
                { label: 'Address',      value: [customer.address?.street, customer.address?.city].filter(Boolean).join(', ') || '—' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                  {row.isJSX
                    ? row.value
                    : <span style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? 'var(--accent)' : 'var(--text)', fontFamily: row.highlight ? 'monospace' : 'inherit' }}>{row.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest bill highlight */}
        {latestBill && (
          <div className="card mt-3" style={{ borderLeft: `3px solid ${latestBill.paymentStatus === 'Paid' ? 'var(--green)' : latestBill.paymentStatus === 'Overdue' ? 'var(--red)' : 'var(--accent)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Latest Bill</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800 }}>{fmtCurrency(latestBill.totalAmount)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {latestBill.billNumber} · {latestBill.billMonth} · {latestBill.unitsConsumed} units
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 8 }}>{statusBadge(latestBill.paymentStatus)}</div>
                {latestBill.paymentStatus !== 'Paid' && (
                  <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>
                    Due: {new Date(latestBill.dueDate).toLocaleDateString('en-IN')}
                  </div>
                )}
                <button
                  className="btn btn-secondary btn-sm mt-1"
                  onClick={() => navigate('/customer/bills')}
                  style={{ marginTop: 8 }}
                >
                  View All Bills →
                </button>
              </div>
            </div>
            {latestBill.paymentStatus !== 'Paid' && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Balance Due</span>
                <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 16 }}>{fmtCurrency(latestBill.balanceDue)}</span>
              </div>
            )}
          </div>
        )}

        {/* Recent readings */}
        {readings.length > 0 && (
          <div className="card mt-3">
            <div className="section-title">📊 Recent Readings</div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Month</th><th>Previous</th><th>Current</th><th>Units Consumed</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {readings.slice(0, 5).map(r => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>{r.readingMonth}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.previousReading}</td>
                      <td style={{ fontWeight: 600 }}>{r.currentReading}</td>
                      <td><span style={{ color: '#10b981', fontWeight: 700 }}>{r.unitsConsumed} kWh</span></td>
                      <td>
                        <span className={`badge ${r.status === 'Billed' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default CustomerDashboard;
