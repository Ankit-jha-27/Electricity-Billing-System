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

// ── QR Payment Modal (3 steps)
const QRPaymentModal = ({ bill, onClose, onPaid }) => {
  const [step, setStep]         = useState(1);
  const [txnId, setTxnId]       = useState('');
  const [txnError, setTxnError] = useState('');
  const [paying, setPaying]     = useState(false);
  const [paidBill, setPaidBill] = useState(null);

  const amount  = bill.balanceDue || bill.totalAmount;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill ' + bill.billNumber)}`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}&bgcolor=111827&color=f59e0b&margin=14`;

  const handleConfirm = async () => {
    if (!txnId.trim()) { setTxnError('Please enter the UPI Transaction ID'); return; }
    setTxnError('');
    setPaying(true);
    try {
      const { data } = await API.post(`/customer/bills/${bill._id}/pay`, { transactionId: txnId.trim() });
      setPaidBill(data.data);
      setStep(3);
      onPaid();
    } catch (err) {
      setTxnError(err.response?.data?.message || 'Payment confirmation failed');
    } finally { setPaying(false); }
  };

  return (
    <div className="modal-backdrop" onClick={step === 3 ? onClose : undefined}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>

        {step === 1 && (<>
          <div className="modal-header">
            <div className="modal-title">📱 Pay via UPI / QR</div>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
              {[['Bill Number', bill.billNumber, true], ['Bill Month', bill.billMonth, false], ['Amount to Pay', fmtCurrency(amount), false]].map(([k, v, mono]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 800, color: k === 'Amount to Pay' ? 'var(--accent)' : 'var(--text)', fontSize: k === 'Amount to Pay' ? 17 : 12, fontFamily: mono ? 'monospace' : 'inherit' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 10, display: 'inline-block', marginBottom: 14, border: '1px solid var(--border-light)' }}>
              <img src={qrUrl} alt="UPI QR" width={200} height={200} style={{ display: 'block', borderRadius: 6 }} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Scan with any UPI app</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>GPay · PhonePe · Paytm · BHIM · Any UPI app</div>

            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>UPI ID</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>{UPI_ID}</span>
                <button onClick={() => { navigator.clipboard?.writeText(UPI_ID); toast.success('Copied!'); }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11 }}>Copy</button>
              </div>
            </div>

            <a href={upiLink} style={{ display: 'block', background: 'var(--bg-hover)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '9px 0', fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>
              📲 Open in UPI App
            </a>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => setStep(2)}>I've Paid — Confirm →</button>
          </div>
        </>)}

        {step === 2 && (<>
          <div className="modal-header">
            <div className="modal-title">🔑 Enter Transaction ID</div>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              ℹ️ Open your UPI app → Payment History → find this transaction → copy the <strong style={{ color: 'var(--text)' }}>Transaction ID / UTR Number</strong> and paste it below.
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Paying for</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{bill.billNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 16 }}>{fmtCurrency(amount)}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">UPI Transaction ID / UTR Number *</label>
              <input className="form-control" value={txnId} onChange={e => { setTxnId(e.target.value); setTxnError(''); }}
                placeholder="e.g. 407123456789" autoFocus style={txnError ? { borderColor: 'var(--red)' } : {}} />
              {txnError && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 5 }}>⚠ {txnError}</div>}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Usually a 12-digit number found in the payment receipt</div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={paying}>
              {paying ? '⏳ Confirming...' : '✓ Confirm Payment'}
            </button>
          </div>
        </>)}

        {step === 3 && (<>
          <div className="modal-header" style={{ borderBottom: 'none' }}>
            <div /><button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', paddingTop: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>✓</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Payment Successful!</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Your bill has been marked as paid.</div>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left' }}>
              {[
                ['Bill Number',    paidBill?.billNumber],
                ['Amount Paid',    fmtCurrency(paidBill?.amountPaid)],
                ['Payment Mode',   'UPI'],
                ['Transaction ID', paidBill?.transactionId],
                ['Date',           paidBill?.paymentDate ? new Date(paidBill.paymentDate).toLocaleString('en-IN') : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: label === 'Amount Paid' ? 'var(--green)' : 'var(--text)', fontFamily: label === 'Transaction ID' ? 'monospace' : 'inherit', fontSize: label === 'Amount Paid' ? 15 : 13 }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thank you! Your account balance has been updated.</div>
          </div>
          <div className="modal-footer" style={{ justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={onClose} style={{ minWidth: 160, justifyContent: 'center' }}>Done</button>
          </div>
        </>)}
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
            {[['Bill Month', bill.billMonth], [`Reading (${bill.previousReading}→${bill.currentReading})`, `${bill.unitsConsumed} kWh`], ['Due Date', new Date(bill.dueDate).toLocaleDateString('en-IN')]].map(([k, v]) => (
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
              {bill.transactionId && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {bill.transactionId}</span>}
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
              <div><div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
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
                    <thead><tr><th>Bill #</th><th>Month</th><th>Units</th><th>Amount</th><th>Balance</th><th>Status</th><th>Due Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {bills.map(b => (
                        <tr key={b._id}>
                          <td><span className="font-mono text-accent" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => setModal({ type: 'detail', bill: b })}>{b.billNumber}</span></td>
                          <td style={{ fontWeight: 600 }}>{b.billMonth}</td>
                          <td style={{ color: 'var(--green)', fontWeight: 600 }}>{b.unitsConsumed}</td>
                          <td style={{ fontWeight: 700 }}>{fmtCurrency(b.totalAmount)}</td>
                          <td style={{ color: b.balanceDue > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>{fmtCurrency(b.balanceDue)}</td>
                          <td>{statusBadge(b.paymentStatus)}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(b.dueDate).toLocaleDateString('en-IN')}</td>
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

      {modal?.type === 'detail' && (
        <BillDetailModal bill={modal.bill} onClose={() => setModal(null)} onPayClick={() => setModal({ type: 'pay', bill: modal.bill })} />
      )}
      {modal?.type === 'pay' && (
        <QRPaymentModal bill={modal.bill} onClose={() => setModal(null)} onPaid={fetchBills} />
      )}
    </>
  );
};

export default CustomerBills;