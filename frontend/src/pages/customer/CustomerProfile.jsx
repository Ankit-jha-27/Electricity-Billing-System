import React, { useEffect, useState } from 'react';
import Topbar from '../../components/layout/Topbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const CustomerProfile = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get('/customer/me')
      .then(r => setCustomer(r.data.data.customer))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" /></div>;
  if (!customer) return null;

  const connStatusColor = { Active: 'var(--green)', Inactive: 'var(--text-muted)', Suspended: 'var(--accent)', Disconnected: 'var(--red)' };
  const connTypeBadge   = { Domestic: 'badge-blue', Commercial: 'badge-purple', Industrial: 'badge-orange', Agricultural: 'badge-green' };

  const rows = [
    { label: 'Customer ID',      value: customer.customerId, mono: true },
    { label: 'Meter Number',     value: customer.meterNumber, mono: true, highlight: true },
    { label: 'Connection Type',  value: customer.connectionType },
    { label: 'Sanctioned Load',  value: `${customer.sanctionedLoad || 0} kW` },
    { label: 'Security Deposit', value: `₹${Number(customer.securityDeposit || 0).toLocaleString('en-IN')}` },
    { label: 'Member Since',     value: new Date(customer.connectionDate || customer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
  ];

  return (
    <>
      <Topbar title="My Profile" subtitle="Your connection and account details" />
      <div className="page-content">
        <div className="grid-2" style={{ alignItems: 'start' }}>

          {/* Profile card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
                {customer.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>{customer.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{customer.email}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge ${connTypeBadge[customer.connectionType] || 'badge-gray'}`}>{customer.connectionType}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: connStatusColor[customer.connectionStatus] }}>● {customer.connectionStatus}</span>
                </div>
              </div>
            </div>

            <div className="divider" />
            <div className="section-title" style={{ fontSize: 13 }}>Connection Details</div>

            {rows.map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: row.highlight ? 'var(--accent)' : 'var(--text)',
                  fontFamily: row.mono ? 'monospace' : 'inherit',
                }}>
                  {row.value || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Address card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="section-title" style={{ fontSize: 13 }}>📍 Address</div>
              {customer.address?.street || customer.address?.city
                ? (
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8 }}>
                    {customer.address.street && <div>{customer.address.street}</div>}
                    {customer.address.city && <div>{customer.address.city}{customer.address.state ? `, ${customer.address.state}` : ''}</div>}
                    {customer.address.pincode && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{customer.address.pincode}</div>}
                  </div>
                )
                : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No address on record</div>
              }
            </div>

            <div className="card">
              <div className="section-title" style={{ fontSize: 13 }}>💳 Account Summary</div>
              {[
                { label: 'Outstanding Balance', value: `₹${Number(customer.outstandingBalance || 0).toLocaleString('en-IN')}`, color: customer.outstandingBalance > 0 ? 'var(--red)' : 'var(--green)' },
                { label: 'Phone',               value: customer.phone || '—', color: 'var(--text)' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>

            {customer.connectionStatus === 'Inactive' && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 6, fontSize: 13 }}>⏳ Activation Pending</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Your connection is awaiting activation by the utility board. Please contact them with your Customer ID <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{customer.customerId}</strong> for faster processing.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProfile;