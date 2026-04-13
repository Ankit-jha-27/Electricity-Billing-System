import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/layout/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', email: '', phone: '',
  address: { street: '', city: '', state: '', pincode: '' },
  connectionType: 'Domestic', connectionStatus: 'Active',
  meterNumber: '', sanctionedLoad: '', securityDeposit: '',
};

const connTypes = ['Domestic', 'Commercial', 'Industrial', 'Agricultural'];
const connStatus = ['Active', 'Inactive', 'Suspended', 'Disconnected'];

const typeBadge = (t) => {
  const map = { Domestic: 'badge-blue', Commercial: 'badge-purple', Industrial: 'badge-orange', Agricultural: 'badge-green' };
  return <span className={`badge ${map[t] || 'badge-gray'}`}>{t}</span>;
};
const statusBadge = (s) => {
  const map = { Active: 'badge-green', Inactive: 'badge-gray', Suspended: 'badge-yellow', Disconnected: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const CustomerModal = ({ customer, onClose, onSaved }) => {
  const [form, setForm] = useState(customer ? { ...customer, address: { ...customer.address } } : { ...emptyForm });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (customer) await API.put(`/customers/${customer._id}`, form);
      else await API.post('/customers', form);
      toast.success(customer ? 'Customer updated!' : 'Customer added!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving customer');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{customer ? '✏️ Edit Customer' : '➕ Add Customer'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Meter Number *</label>
                <input className="form-control" value={form.meterNumber} onChange={e => set('meterNumber', e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Connection Type</label>
                <select className="form-control" value={form.connectionType} onChange={e => set('connectionType', e.target.value)}>
                  {connTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.connectionStatus} onChange={e => set('connectionStatus', e.target.value)}>
                  {connStatus.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sanctioned Load (kW)</label>
                <input className="form-control" type="number" value={form.sanctionedLoad} onChange={e => set('sanctionedLoad', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Security Deposit (₹)</label>
                <input className="form-control" type="number" value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} />
              </div>
            </div>
            <div className="divider" />
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Address</div>
            <div className="form-group">
              <label className="form-label">Street</label>
              <input className="form-control" value={form.address.street} onChange={e => setAddr('street', e.target.value)} />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-control" value={form.address.state} onChange={e => setAddr('state', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-control" value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (customer ? 'Update' : 'Add Customer')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'add' | customer obj

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (typeFilter) params.set('connectionType', typeFilter);
      if (statusFilter) params.set('connectionStatus', statusFilter);
      const { data } = await API.get(`/customers?${params}`);
      setCustomers(data.data); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await API.delete(`/customers/${id}`); toast.success('Customer deleted'); fetchCustomers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <>
      <Topbar title="Customers" subtitle={`${total} total connections`}
        actions={<button className="btn btn-primary" onClick={() => setModal('add')}>➕ Add Customer</button>} />
      <div className="page-content">
        <div className="filters-bar">
          <div className="search-input-wrap">
            <span className="icon">🔍</span>
            <input className="form-control search-input" placeholder="Search name, ID, meter, email, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {connTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-control filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {connStatus.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-text">No customers found</div>
              <div className="empty-sub">Try adjusting your filters or add a new customer</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Customer</th><th>Meter No.</th><th>Type</th><th>Status</th><th>Load (kW)</th><th>Outstanding</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{c.customerId} • {c.email}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{c.phone}</div>
                      </td>
                      <td><span className="font-mono" style={{ color: '#f59e0b' }}>{c.meterNumber}</span></td>
                      <td>{typeBadge(c.connectionType)}</td>
                      <td>{statusBadge(c.connectionStatus)}</td>
                      <td>{c.sanctionedLoad} kW</td>
                      <td style={{ fontWeight: 700, color: c.outstandingBalance > 0 ? '#ef4444' : '#10b981' }}>
                        ₹{Number(c.outstandingBalance || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(c)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>🗑️</button>
                        </div>
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

      {modal && (
        <CustomerModal
          customer={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchCustomers(); }}
        />
      )}
    </>
  );
};

export default CustomersPage;