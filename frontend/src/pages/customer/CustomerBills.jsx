import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../../components/layout/Topbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const statusBadge = (s) => {
  const map = { Paid: 'badge-green', Unpaid: 'badge-red', Overdue: 'badge-orange', Partial: 'badge-yellow' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const UPI_ID   = 'jhaankitjha03@oksbi';
const UPI_NAME = 'PowerBill EBS';

// ── QR Payment Modal — 2 steps only: QR → Success ────────────
const QRPaymentModal = ({ bill, onClose, onPaid }) => {
  const [step, setPaying_step] = useState('qr');  // 'qr' | 'confirming' | 'success'
  const [paidBill, setPaidBill] = useState(null);

  const amount  = bill.balanceDue > 0 ? bill.balanceDue : bill.totalAmount;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill ' + bill.billNumber)}`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}&bgcolor=111827&color=f59e0b&margin=12`;

  const handleConfirm = async () => {
    setPaying_step('confirming');
    try {
      const { data } = await API.post(`/customer/bills/${bill._id}/pay`, {});
      setPaidBill(data.data);
      setPaying_step('success');
      onPaid(); // silently refresh the bills list + dashboards
      toast.success('Payment confirmed! ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setPaying_step('qr');
    }
  };

  // Step: QR Code
  if (step === 'qr' || step === 'confirming') return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📱 Pay via UPI</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>

          {/* Bill summary */}
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bill Number</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>{bill.billNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bill Month</span>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{bill.billMonth}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amount</span>
              <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 20, fontFamily: 'Syne, sans-serif' }}>{fmtCurrency(amount)}</span>
            </div>
          </div>

          {/* QR code */}
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 10, display: 'inline-block', marginBottom: 14, border: '1px solid var(--border-light)' }}>
            <img src={qrUrl} alt="UPI QR Code" width={180} height={180} style={{ display: 'block', borderRadius: 6 }} />
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
            Scan with any UPI app
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            GPay &nbsp;·&nbsp; PhonePe &nbsp;·&nbsp; Paytm &nbsp;·&nbsp; BHIM &nbsp;·&nbsp; Any UPI app
          </div>

          {/* UPI ID row */}
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>UPI ID</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>{UPI_ID}</span>
              <button
                onClick={() => { navigator.clipboard?.writeText(UPI_ID); toast.success('Copied!'); }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11 }}
              >Copy</button>
            </div>
          </div>

          {/* Open in app */}
          <a href={upiLink} style={{ display: 'block', background: 'var(--bg-hover)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '8px 0', fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', marginBottom: 4 }}>
            📲 Open UPI App directly
          </a>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={step === 'confirming'}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={step === 'confirming'}
            style={{ minWidth: 160, justifyContent: 'center' }}
          >
            {step === 'confirming'
              ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: 8 }} />Confirming...</>
              : '✓ I\'ve Paid'}
          </button>
        </div>
      </div>
    </div>
  );

  // Step: Success
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none' }}>
          <div /><button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center', paddingTop: 0 }}>

          {/* Success circle */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 34 }}>
            ✓
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
            Payment Successful!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>
            Your bill has been marked as paid and your account balance updated.
          </div>

          {/* Receipt */}
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, textAlign: 'left', marginBottom: 20 }}>
            {[
              ['Bill',        paidBill?.billNumber],
              ['Month',       paidBill?.billMonth],
              ['Amount Paid', fmtCurrency(paidBill?.amountPaid)],
              ['Mode',        'UPI / QR'],
              ['Reference',   paidBill?.transactionId],
              ['Date & Time', paidBill?.paymentDate ? new Date(paidBill.paymentDate).toLocaleString('en-IN') : '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{
                  fontWeight: 700,
                  color: label === 'Amount Paid' ? 'var(--green)' : 'var(--text)',
                  fontFamily: label === 'Reference' ? 'monospace' : 'inherit',
                  fontSize: label === 'Amount Paid' ? 14 : 12,
                }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ minWidth: 140, justifyContent: 'center' }}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ── Bill Detail Modal ─────────────────────────────────────────
const BillDetailModal = ({ bill, onClose, onPayClick }) => {
  const rows = [
    ['Energy Charges', bill.energyCharges],
    ['Fixed Charges', bill.fixedCharges],
    ['Fuel Adjustment Charge', bill.fuelAdjustmentCharge],
    ['Electricity Duty', bill.electricityDuty],
    ['Arrears', bill.arrears],
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
            {[
              ['Bill Month', bill.billMonth],
              [`Reading (${bill.previousReading}→${bill.currentReading})`, `${bill.unitsConsumed} kWh`],
              ['Due Date', new Date(bill.dueDate).toLocaleDateString('en-IN')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
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
          {bill.balanceDue > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--red)', fontWeight: 700, marginTop: 4 }}>
              <span>Balance Due</span><span>{fmtCurrency(bill.balanceDue)}</span>
            </div>
          )}
          {bill.paymentStatus === 'Paid' && bill.paymentDate && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--green)', textAlign: 'center', background: 'var(--green-dim)', borderRadius: 6, padding: 8 }}>
              ✓ Paid on {new Date(bill.paymentDate).toLocaleDateString('en-IN')}
              {bill.transactionId && (
                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontFamily: 'monospace' }}>· {bill.transactionId}</span>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {bill.paymentStatus !== 'Paid' && (
            <button className="btn btn-primary" onClick={onPayClick}>📱 Pay Now</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const CustomerBills = () => {
  const [bills, setBills]               = useState([]);
  const [total, setTotal]               = useState(0);
  const [pages, setPages]               = useState(1);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const [modal, setModal]               = useState(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (statusFilter) params.set('paymentStatus', statusFilter);
      const { data } = await API.get(`/customer/bills?${params}`);
      setBills(data.data); setTotal(data.total); setPages(data.pages);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  // After payment: refresh bills + fire a global event so CustomerDashboard
  // re-fetches its stats without needing a page reload
  const handlePaid = useCallback(() => {
    fetchBills();
    window.dispatchEvent(new CustomEvent('bill-paid'));
  }, [fetchBills]);

  const totalDue  = bills.filter(b => b.paymentStatus !== 'Paid').reduce((s, b) => s + (b.balanceDue || 0), 0);
  const totalPaid = bills.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + (b.amountPaid || 0), 0);

  return (
    <>
      <Topbar title="My Bills" subtitle={`${total} total bills`} />
      <div className="page-content">

        <div className="grid-3 mb-3">
          {[
            { label: 'Total Bills', value: total,                  color: '#3b82f6', icon: '🧾' },
            { label: 'Amount Due',  value: fmtCurrency(totalDue),  color: '#ef4444', icon: '⚠️' },
            { label: 'Total Paid',  value: fmtCurrency(totalPaid), color: '#10b981', icon: '✅' },
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
                      <tr><th>Bill #</th><th>Month</th><th>Units</th><th>Amount</th><th>Balance</th><th>Status</th><th>Due Date</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {bills.map(b => (
                        <tr key={b._id}>
                          <td>
                            <span className="font-mono text-accent" style={{ fontSize: 12, cursor: 'pointer' }}
                              onClick={() => setModal({ type: 'detail', bill: b })}>
                              {b.billNumber}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{b.billMonth}</td>
                          <td style={{ color: 'var(--green)', fontWeight: 600 }}>{b.unitsConsumed}</td>
                          <td style={{ fontWeight: 700 }}>{fmtCurrency(b.totalAmount)}</td>
                          <td style={{ color: b.balanceDue > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                            {fmtCurrency(b.balanceDue)}
                          </td>
                          <td>{statusBadge(b.paymentStatus)}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {new Date(b.dueDate).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            <div className="actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'detail', bill: b })}>View</button>
                              {b.paymentStatus !== 'Paid' && (
                                <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'pay', bill: b })}>📱 Pay</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
          }
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

      {modal?.type === 'detail' && (
        <BillDetailModal
          bill={modal.bill}
          onClose={() => setModal(null)}
          onPayClick={() => setModal({ type: 'pay', bill: modal.bill })}
        />
      )}
      {modal?.type === 'pay' && (
        <QRPaymentModal
          bill={modal.bill}
          onClose={() => setModal(null)}
          onPaid={handlePaid}
        />
      )}
    </>
  );
};

export default CustomerBills;
