import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../../components/layout/Topbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const connTypes = ['Domestic', 'Commercial', 'Industrial', 'Agricultural'];

const statusBadge = (s) => {
  const map = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
};

// ── Approve Modal ─────────────────────────────────────────────
const ApproveModal = ({ reg, onClose, onDone }) => {
  const [form, setForm] = useState({
    meterNumber:     '',
    phone:           reg.phone || '',
    connectionType:  reg.connectionType || 'Domestic',
    sanctionedLoad:  '',
    securityDeposit: '',
    address: {
      street:  reg.address?.street  || '',
      city:    reg.address?.city    || '',
      state:   reg.address?.state   || '',
      pincode: reg.address?.pincode || '',
    },
  });
  const [saving, setSaving] = useState(false);

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.meterNumber.trim()) { toast.error('Meter number is required'); return; }
    setSaving(true);
    try {
      const { data } = await API.post(`/registrations/${reg._id}/approve`, form);
      toast.success(data.message);
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✅ Approve — {reg.name}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Applicant summary */}
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 12 }}>
                {[
                  ['Name',    reg.name],
                  ['Email',   reg.email],
                  ['Phone',   reg.phone || '—'],
                  ['Type',    reg.connectionType],
                  ['Applied', new Date(reg.createdAt).toLocaleDateString('en-IN')],
                  ['Message', reg.message || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}: </span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connection Details */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Connection Details
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Meter Number *</label>
                <input
                  className="form-control"
                  value={form.meterNumber}
                  onChange={e => set('meterNumber', e.target.value)}
                  placeholder="e.g. MTR-00123"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Connection Type</label>
              <select className="form-control" value={form.connectionType} onChange={e => set('connectionType', e.target.value)}>
                {connTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sanctioned Load (kW)</label>
                <input
                  className="form-control"
                  type="number" min="0" step="0.5"
                  value={form.sanctionedLoad}
                  onChange={e => set('sanctionedLoad', e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Security Deposit (₹)</label>
                <input
                  className="form-control"
                  type="number" min="0"
                  value={form.securityDeposit}
                  onChange={e => set('securityDeposit', e.target.value)}
                  placeholder="e.g. 2000"
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 12px' }}>
              📍 Customer Address
            </div>

            <div className="form-group">
              <label className="form-label">Street / House No.</label>
              <input
                className="form-control"
                value={form.address.street}
                onChange={e => setAddr('street', e.target.value)}
                placeholder="e.g. 12 MG Road, Near Post Office"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  className="form-control"
                  value={form.address.city}
                  onChange={e => setAddr('city', e.target.value)}
                  placeholder="e.g. Kolkata"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  className="form-control"
                  value={form.address.state}
                  onChange={e => setAddr('state', e.target.value)}
                  placeholder="e.g. West Bengal"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                className="form-control"
                value={form.address.pincode}
                onChange={e => setAddr('pincode', e.target.value)}
                placeholder="e.g. 700001"
                style={{ maxWidth: 160 }}
              />
            </div>

            <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--green)' }}>
              ✓ Approving will create a Customer record, assign a Customer ID, and activate this connection.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? '⏳ Approving...' : '✅ Approve & Activate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Reject Modal ──────────────────────────────────────────────
const RejectModal = ({ reg, onClose, onDone }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.post(`/registrations/${reg._id}/reject`, { reason });
      toast.success(data.message);
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🚫 Reject — {reg.name}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--red)' }}>
              ⚠️ This will reject the application for <strong>{reg.email}</strong>. The user account will remain but no customer record will be created.
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Rejection</label>
              <textarea
                className="form-control"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Incomplete address, duplicate application, service area not covered..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={saving}>
              {saving ? '⏳ Rejecting...' : '🚫 Reject Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [pendingCount, setPendingCount]   = useState(0);
  const [loading, setLoading]             = useState(true);
  const [statusFilter, setStatusFilter]   = useState('pending');
  const [modal, setModal]                 = useState(null); // { type: 'approve'|'reject', reg }

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/registrations?status=${statusFilter}`);
      setRegistrations(data.data);
      setPendingCount(data.pendingCount);
    } catch {
      toast.error('Failed to load registrations');
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const handleDone = () => {
    setModal(null);
    fetchRegistrations();
  };

  return (
    <>
      <Topbar
        title="Customer Registrations"
        subtitle="Review and approve new connection requests"
        actions={
          pendingCount > 0 && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--red)', fontWeight: 700 }}>
              🔔 {pendingCount} pending
            </div>
          )
        }
      />

      <div className="page-content">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { value: 'pending',  label: '⏳ Pending',  color: 'var(--accent)' },
            { value: 'approved', label: '✅ Approved', color: 'var(--green)'  },
            { value: 'rejected', label: '🚫 Rejected', color: 'var(--red)'   },
            { value: 'all',      label: '📋 All',      color: 'var(--blue)'  },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: statusFilter === tab.value ? `1px solid ${tab.color}` : '1px solid var(--border)',
                background: statusFilter === tab.value ? `${tab.color}18` : 'var(--bg-card)',
                color: statusFilter === tab.value ? tab.color : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: statusFilter === tab.value ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--red)', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-text">No {statusFilter === 'all' ? '' : statusFilter} registrations</div>
              <div className="empty-sub">
                {statusFilter === 'pending' ? 'No new applications waiting for review' : 'Nothing to show here'}
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Phone</th>
                    <th>Connection Type</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Reviewed By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{reg.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{reg.email}</div>
                        {reg.message && (
                          <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 2, fontStyle: 'italic' }}>
                            💬 "{reg.message.slice(0, 50)}{reg.message.length > 50 ? '…' : ''}"
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-dim)' }}>{reg.phone || '—'}</td>
                      <td>
                        <span className={`badge ${
                          reg.connectionType === 'Domestic'    ? 'badge-blue'   :
                          reg.connectionType === 'Commercial'  ? 'badge-purple' :
                          reg.connectionType === 'Industrial'  ? 'badge-orange' : 'badge-green'
                        }`}>{reg.connectionType}</span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>{statusBadge(reg.status)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {reg.reviewedBy?.name || '—'}
                        {reg.reviewedAt && (
                          <div style={{ fontSize: 10 }}>{new Date(reg.reviewedAt).toLocaleDateString('en-IN')}</div>
                        )}
                        {reg.rejectReason && (
                          <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 2 }}>Reason: {reg.rejectReason}</div>
                        )}
                      </td>
                      <td>
                        {reg.status === 'pending' ? (
                          <div className="actions">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setModal({ type: 'approve', reg })}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setModal({ type: 'reject', reg })}
                            >
                              🚫 Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {reg.status === 'approved' ? '✅ Done' : '🚫 Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal?.type === 'approve' && (
        <ApproveModal reg={modal.reg} onClose={() => setModal(null)} onDone={handleDone} />
      )}
      {modal?.type === 'reject' && (
        <RejectModal reg={modal.reg} onClose={() => setModal(null)} onDone={handleDone} />
      )}
    </>
  );
};

export default RegistrationsPage;