import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/layout/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
  const map = { Pending: 'badge-yellow', Billed: 'badge-green', Estimated: 'badge-blue' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const ReadingModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ customer: '', currentReading: '', readingDate: new Date().toISOString().split('T')[0], remarks: '' });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/customers?limit=100').then(r => setCustomers(r.data.data));
  }, []);

  const handleCustomerChange = (id) => {
    setForm(f => ({ ...f, customer: id }));
    const c = customers.find(c => c._id === id);
    setSelectedCustomer(c || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/readings', form);
      toast.success('Reading recorded!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving reading'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📊 Record Meter Reading</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select className="form-control" value={form.customer} onChange={e => handleCustomerChange(e.target.value)} required>
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.meterNumber}</option>)}
              </select>
            </div>
            {selectedCustomer && (
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Meter: <strong style={{ color: '#f59e0b' }}>{selectedCustomer.meterNumber}</strong></div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Type: {selectedCustomer.connectionType}</div>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Reading (Units) *</label>
                <input className="form-control" type="number" min="0" value={form.currentReading} onChange={e => setForm(f => ({ ...f, currentReading: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Reading Date *</label>
                <input className="form-control" type="date" value={form.readingDate} onChange={e => setForm(f => ({ ...f, readingDate: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <input className="form-control" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Record Reading'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReadingsPage = () => {
  const [readings, setReadings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (month) params.set('month', month);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await API.get(`/readings?${params}`);
      setReadings(data.data); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load readings'); }
    finally { setLoading(false); }
  }, [page, month, statusFilter]);

  useEffect(() => { fetchReadings(); }, [fetchReadings]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reading?')) return;
    try { await API.delete(`/readings/${id}`); toast.success('Reading deleted'); fetchReadings(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <>
      <Topbar title="Meter Readings" subtitle={`${total} total readings`}
        actions={<button className="btn btn-primary" onClick={() => setShowModal(true)}>📊 Record Reading</button>} />
      <div className="page-content">
        <div className="filters-bar">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input className="form-control" type="month" value={month} onChange={e => { setMonth(e.target.value); setPage(1); }}
              style={{ minWidth: 180 }} />
          </div>
          <select className="form-control filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['Pending', 'Billed', 'Estimated'].map(s => <option key={s}>{s}</option>)}
          </select>
          {(month || statusFilter) && <button className="btn btn-secondary btn-sm" onClick={() => { setMonth(''); setStatusFilter(''); setPage(1); }}>✕ Clear</button>}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <div className="loading-state"><div className="spinner" /></div>
            : readings.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No readings found</div></div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Customer</th><th>Meter No.</th><th>Previous</th><th>Current</th><th>Units</th><th>Month</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {readings.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.customer?.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{r.customer?.customerId}</div>
                        </td>
                        <td><span className="font-mono text-accent">{r.meterNumber}</span></td>
                        <td>{r.previousReading}</td>
                        <td style={{ fontWeight: 600 }}>{r.currentReading}</td>
                        <td><span style={{ color: '#10b981', fontWeight: 700 }}>{r.unitsConsumed} kWh</span></td>
                        <td>{r.readingMonth}</td>
                        <td>{statusBadge(r.status)}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {pages > 1 && (
          <div className="pagination">
            <span className="page-info">{total} results</span>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
          </div>
        )}
      </div>
      {showModal && <ReadingModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchReadings(); }} />}
    </>
  );
};

export default ReadingsPage;