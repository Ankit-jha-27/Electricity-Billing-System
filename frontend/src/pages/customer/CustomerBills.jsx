import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../../components/layout/Topbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const statusBadge = (s) => {
  const map = { Paid: 'badge-green', Unpaid: 'badge-red', Overdue: 'badge-orange', Partial: 'badge-yellow' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const BillDetailModal = ({ bill, onClose }) => {
  const rows = [
    ['Energy Charges',          bill.energyCharges],
    ['Fixed Charges',           bill.fixedCharges],
    ['Fuel Adjustment Charge',  bill.fuelAdjustmentCharge],
    ['Electricity Duty',        bill.electricityDuty],
    ['Arrears',                 bill.arrears],
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🧾 {bill.billNumber}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bill Month</span>
              <span style={{ fontWeight: 600 }}>{bill.billMonth}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reading ({bill.previousReading} → {bill.currentReading})</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>{bill.unitsConsumed} kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due Date</span>
              <span style={{ fontSize: 12 }}>{new Date(bill.dueDate).toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          <div className="section-title" style={{ fontSize: 13 }}>Charges Breakdown</div>
          {rows.filter(([, v]) => v > 0).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span>{fmtCurrency(val)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 16, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
            <span>Total Amount</span>
            <span style={{ color: 'var(--accent)' }}>{fmtCurrency(bill.totalAmount)}</span>
          </div>
          {bill.amountPaid > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--green)' }}>
              <span>Amount Paid ({bill.paymentMode || 'Online'})</span>
              <span>{fmtCurrency(bill.amountPaid)}</span>
            </div>
          )}
          {bill.balanceDue > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--red)', fontWeight: 700, marginTop: 4 }}>
              <span>Balance Due</span>
              <span>{fmtCurrency(bill.balanceDue)}</span>
            </div>
          )}
          {bill.paymentStatus === 'Paid' && bill.paymentDate && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--green)', textAlign: 'center', background: 'var(--green-dim)', borderRadius: 6, padding: '8px' }}>
              ✓ Paid on {new Date(bill.paymentDate).toLocaleDateString('en-IN')}
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

const CustomerBills = () => {
  const [bills, setBills]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (statusFilter) params.set('paymentStatus', statusFilter);
      const { data } = await API.get(`/customer/bills?${params}`);
      setBills(data.data); setTotal(data.total); setPages(data.pages);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  // Summary totals
  const totalDue  = bills.filter(b => b.paymentStatus !== 'Paid').reduce((s, b) => s + (b.balanceDue || 0), 0);
  const totalPaid = bills.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + (b.amountPaid || 0), 0);

  return (
    <>
      <Topbar title="My Bills" subtitle={`${total} total bills`} />
      <div className="page-content">

        {/* Summary strip */}
        <div className="grid-3 mb-3">
          {[
            { label: 'Total Bills',    value: total,                color: '#3b82f6', icon: '🧾' },
            { label: 'Amount Due',     value: fmtCurrency(totalDue), color: '#ef4444', icon: '⚠️' },
            { label: 'Total Paid',     value: fmtCurrency(totalPaid),color: '#10b981', icon: '✅' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
              <div>
                <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="filters-bar">
          <select className="form-control filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Bills</option>
            {['Unpaid', 'Paid', 'Partial', 'Overdue'].map(s => <option key={s}>{s}</option>)}
          </select>
          {statusFilter && <button className="btn btn-secondary btn-sm" onClick={() => { setStatusFilter(''); setPage(1); }}>✕ Clear</button>}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading
            ? <div className="loading-state"><div className="spinner" /></div>
            : bills.length === 0
              ? <div className="empty-state"><div className="empty-icon">🧾</div><div className="empty-text">No bills found</div></div>
              : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr><th>Bill #</th><th>Month</th><th>Units</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Due Date</th><th></th></tr>
                    </thead>
                    <tbody>
                      {bills.map(b => (
                        <tr key={b._id}>
                          <td><span className="font-mono text-accent" style={{ fontSize: 12 }}>{b.billNumber}</span></td>
                          <td style={{ fontWeight: 600 }}>{b.billMonth}</td>
                          <td style={{ color: 'var(--green)', fontWeight: 600 }}>{b.unitsConsumed}</td>
                          <td style={{ fontWeight: 700 }}>{fmtCurrency(b.totalAmount)}</td>
                          <td style={{ color: 'var(--green)' }}>{fmtCurrency(b.amountPaid)}</td>
                          <td style={{ color: b.balanceDue > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>{fmtCurrency(b.balanceDue)}</td>
                          <td>{statusBadge(b.paymentStatus)}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(b.dueDate).toLocaleDateString('en-IN')}</td>
                          <td><button className="btn btn-secondary btn-sm" onClick={() => setSelected(b)}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>

        {pages > 1 && (
          <div className="pagination">
            <span className="page-info">{total} bills</span>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>›</button>
          </div>
        )}
      </div>

      {selected && <BillDetailModal bill={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default CustomerBills;