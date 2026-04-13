import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/layout/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const statusBadge = (s) => {
  const map = { Paid: 'badge-green', Unpaid: 'badge-red', Overdue: 'badge-orange', Partial: 'badge-yellow' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const GenerateBillModal = ({ onClose, onSaved }) => {
  const [customers, setCustomers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState({ customerId: '', readingId: '', billMonth: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/customers?limit=100').then(r => setCustomers(r.data.data));
  }, []);

  const handleCustomerChange = async (id) => {
    setForm(f => ({ ...f, customerId: id, readingId: '' }));
    if (id) {
      const { data } = await API.get(`/readings?customerId=${id}&status=Pending&limit=20`);
      setReadings(data.data);
    } else setReadings([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.post('/bills', form);
      toast.success('Bill generated successfully!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Error generating bill'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🧾 Generate Bill</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select className="form-control" value={form.customerId} onChange={e => handleCustomerChange(e.target.value)} required>
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.customerId}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Meter Reading *</label>
              <select className="form-control" value={form.readingId} onChange={e => setForm(f => ({ ...f, readingId: e.target.value }))} required disabled={!readings.length}>
                <option value="">{readings.length ? 'Select reading...' : 'No pending readings'}</option>
                {readings.map(r => <option key={r._id} value={r._id}>{r.readingMonth} — {r.unitsConsumed} units ({r.previousReading}→{r.currentReading})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bill Month</label>
              <input className="form-control" type="month" value={form.billMonth} onChange={e => setForm(f => ({ ...f, billMonth: e.target.value }))} />
            </div>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: 12, fontSize: 12, color: '#94a3b8' }}>
              💡 Bill amount is calculated automatically based on the applicable tariff slabs for the customer's connection type.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.readingId}>{saving ? 'Generating...' : 'Generate Bill'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ bill, onClose, onSaved }) => {
  const [form, setForm] = useState({ amountPaid: bill.balanceDue || bill.totalAmount, paymentMode: 'Online', transactionId: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await API.put(`/bills/${bill._id}/payment`, form);
      toast.success('Payment recorded!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">💳 Record Payment</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Bill: <strong style={{ color: '#f59e0b' }}>{bill.billNumber}</strong></div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Customer: <strong style={{ color: '#e2e8f0' }}>{bill.customer?.name}</strong></div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Total: <strong style={{ color: '#f59e0b' }}>{fmtCurrency(bill.totalAmount)}</strong> | Paid: {fmtCurrency(bill.amountPaid)} | Due: <strong style={{ color: '#ef4444' }}>{fmtCurrency(bill.balanceDue)}</strong></div>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Paying (₹) *</label>
              <input className="form-control" type="number" min="1" max={bill.balanceDue} value={form.amountPaid} onChange={e => setForm(f => ({ ...f, amountPaid: Number(e.target.value) }))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Payment Mode *</label>
                <select className="form-control" value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}>
                  {['Cash', 'Online', 'UPI', 'Card', 'Cheque'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transaction ID</label>
                <input className="form-control" value={form.transactionId} onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Processing...' : '✓ Confirm Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BillDetailModal = ({ bill, onClose }) => {
  const rows = [
    ['Energy Charges', bill.energyCharges],
    ['Fixed Charges', bill.fixedCharges],
    ['Fuel Adjustment Charge', bill.fuelAdjustmentCharge],
    ['Electricity Duty', bill.electricityDuty],
    ['Arrears / Previous Due', bill.arrears],
    ['Surcharge', bill.surcharge],
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🧾 {bill.billNumber}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{bill.customer?.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{bill.customer?.customerId} | {bill.customer?.meterNumber}</div>
            </div>
            <div>{statusBadge(bill.paymentStatus)}</div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>Bill Month</span><span style={{ fontWeight: 600 }}>{bill.billMonth}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>Units Consumed</span><span style={{ fontWeight: 700, color: '#10b981' }}>{bill.unitsConsumed} kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: 12 }}>Reading ({bill.previousReading} → {bill.currentReading})</span>
            </div>
          </div>
          <div className="divider" />
          <div className="section-title" style={{ fontSize: 13 }}>Charges Breakdown</div>
          {rows.filter(([, v]) => v > 0).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2d45', fontSize: 13 }}>
              <span style={{ color: '#94a3b8' }}>{label}</span>
              <span>{fmtCurrency(val)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 15, fontWeight: 800, fontFamily: 'Syne' }}>
            <span>Total Amount</span>
            <span style={{ color: '#f59e0b' }}>{fmtCurrency(bill.totalAmount)}</span>
          </div>
          {bill.amountPaid > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10b981' }}>
              <span>Amount Paid ({bill.paymentMode})</span><span>{fmtCurrency(bill.amountPaid)}</span>
            </div>
          )}
          {bill.balanceDue > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ef4444', fontWeight: 700 }}>
              <span>Balance Due</span><span>{fmtCurrency(bill.balanceDue)}</span>
            </div>
          )}
          {bill.dueDate && (
            <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
              Due Date: {new Date(bill.dueDate).toLocaleDateString('en-IN')}
              {bill.paymentDate && ` | Paid on: ${new Date(bill.paymentDate).toLocaleDateString('en-IN')}`}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // 'generate' | { type: 'payment'|'detail', bill }

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (month) params.set('month', month);
      if (statusFilter) params.set('paymentStatus', statusFilter);
      const { data } = await API.get(`/bills?${params}`);
      setBills(data.data); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [page, search, month, statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try { await API.delete(`/bills/${id}`); toast.success('Bill deleted'); fetchBills(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <>
      <Topbar title="Bills" subtitle={`${total} total bills`}
        actions={<button className="btn btn-primary" onClick={() => setModal('generate')}>🧾 Generate Bill</button>} />
      <div className="page-content">
        <div className="filters-bar">
          <div className="search-input-wrap">
            <span className="icon">🔍</span>
            <input className="form-control search-input" placeholder="Search bill no., customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <input className="form-control" type="month" value={month} onChange={e => { setMonth(e.target.value); setPage(1); }} style={{ minWidth: 180 }} />
          <select className="form-control filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['Unpaid', 'Paid', 'Partial', 'Overdue'].map(s => <option key={s}>{s}</option>)}
          </select>
          {(search || month || statusFilter) && <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setMonth(''); setStatusFilter(''); setPage(1); }}>✕ Clear</button>}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <div className="loading-state"><div className="spinner" /></div>
            : bills.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🧾</div><div className="empty-text">No bills found</div></div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Bill #</th><th>Customer</th><th>Month</th><th>Units</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Due Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {bills.map(b => (
                      <tr key={b._id}>
                        <td><span className="font-mono text-accent" style={{ cursor: 'pointer' }} onClick={() => setModal({ type: 'detail', bill: b })}>{b.billNumber}</span></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.customer?.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{b.customer?.customerId}</div>
                        </td>
                        <td>{b.billMonth}</td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>{b.unitsConsumed}</td>
                        <td style={{ fontWeight: 700 }}>{fmtCurrency(b.totalAmount)}</td>
                        <td style={{ color: '#10b981' }}>{fmtCurrency(b.amountPaid)}</td>
                        <td style={{ color: b.balanceDue > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{fmtCurrency(b.balanceDue)}</td>
                        <td>{statusBadge(b.paymentStatus)}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(b.dueDate).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'detail', bill: b })}>👁</button>
                            {b.paymentStatus !== 'Paid' && (
                              <button className="btn btn-success btn-sm" onClick={() => setModal({ type: 'payment', bill: b })}>💳</button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>🗑️</button>
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

      {modal === 'generate' && <GenerateBillModal onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchBills(); }} />}
      {modal?.type === 'payment' && <PaymentModal bill={modal.bill} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchBills(); }} />}
      {modal?.type === 'detail' && <BillDetailModal bill={modal.bill} onClose={() => setModal(null)} />}
    </>
  );
};

export default BillsPage;