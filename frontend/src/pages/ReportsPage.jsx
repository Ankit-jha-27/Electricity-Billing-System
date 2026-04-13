import React, { useState } from 'react';
import Topbar from '../components/layout/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

const connTypes = ['Domestic', 'Commercial', 'Industrial', 'Agricultural'];
const connStatuses = ['Active', 'Inactive', 'Suspended', 'Disconnected'];
const payStatuses = ['Unpaid', 'Paid', 'Partial', 'Overdue'];
const readingStatuses = ['Pending', 'Billed', 'Estimated'];

const downloadCSV = (csvText, filename) => {
  const blob = new Blob([csvText], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const StatRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e2d45' }}>
    <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
    <span style={{ fontWeight: 700, color: color || '#e2e8f0' }}>{value}</span>
  </div>
);

const ReportCard = ({ icon, title, description, filters, onExport, loading }) => (
  <div className="card">
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{description}</div>
      </div>
    </div>
    {filters}
    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
      <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onExport('json')} disabled={loading}>
        {loading === 'json' ? '⏳ Loading...' : '📋 View JSON'}
      </button>
      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onExport('csv')} disabled={loading}>
        {loading === 'csv' ? '⏳ Loading...' : '⬇️ Export CSV'}
      </button>
    </div>
  </div>
);

const DataPreview = ({ data, onClose }) => {
  if (!data) return null;
  const cols = data.length > 0 ? Object.keys(data[0]) : [];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 12, width: '90%', maxWidth: 900, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">📋 Report Preview ({data.length} records)</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table className="table">
            <thead>
              <tr>{cols.slice(0, 8).map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {data.slice(0, 50).map((row, i) => (
                <tr key={i}>
                  {cols.slice(0, 8).map(c => (
                    <td key={c} style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 50 && <div style={{ textAlign: 'center', padding: 12, color: '#64748b', fontSize: 12 }}>Showing 50 of {data.length} records. Export CSV for full data.</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => downloadJSON(data, 'report.json')}>⬇️ Download JSON</button>
        </div>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  const [custFilters, setCustFilters] = useState({ connectionType: '', connectionStatus: '' });
  const [billFilters, setBillFilters] = useState({ month: '', paymentStatus: '' });
  const [readFilters, setReadFilters] = useState({ month: '', status: '' });
  const [loadingMap, setLoadingMap] = useState({});
  const [preview, setPreview] = useState(null);

  const setLoading = (key, val) => setLoadingMap(m => ({ ...m, [key]: val }));

  const exportReport = async (type, filters, format) => {
    const key = `${type}-${format}`;
    setLoading(key, format);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      params.set('format', format);

      if (format === 'csv') {
        const resp = await fetch(`/api/reports/${type}?${params}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('ebs_token')}` }
        });
        const text = await resp.text();
        downloadCSV(text, `${type}-report.csv`);
        toast.success('CSV downloaded!');
      } else {
        const { data } = await API.get(`/reports/${type}?${params}`);
        setPreview(data.data);
      }
    } catch { toast.error('Export failed'); }
    finally { setLoading(key, false); }
  };

  const reports = [
    {
      id: 'customers',
      icon: '👥',
      title: 'Customer Report',
      description: 'Export all customer connection details, meter numbers, outstanding balances.',
      filters: (
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Connection Type</label>
            <select className="form-control" value={custFilters.connectionType} onChange={e => setCustFilters(f => ({ ...f, connectionType: e.target.value }))}>
              <option value="">All Types</option>
              {connTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Connection Status</label>
            <select className="form-control" value={custFilters.connectionStatus} onChange={e => setCustFilters(f => ({ ...f, connectionStatus: e.target.value }))}>
              <option value="">All Statuses</option>
              {connStatuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ),
      onExport: (fmt) => exportReport('customers', custFilters, fmt),
      loading: loadingMap['customers-csv'] || loadingMap['customers-json'],
    },
    {
      id: 'bills',
      icon: '🧾',
      title: 'Bills Report',
      description: 'Export billing records with amounts, payment status, due dates.',
      filters: (
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bill Month</label>
            <input className="form-control" type="month" value={billFilters.month} onChange={e => setBillFilters(f => ({ ...f, month: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Payment Status</label>
            <select className="form-control" value={billFilters.paymentStatus} onChange={e => setBillFilters(f => ({ ...f, paymentStatus: e.target.value }))}>
              <option value="">All</option>
              {payStatuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ),
      onExport: (fmt) => exportReport('bills', billFilters, fmt),
      loading: loadingMap['bills-csv'] || loadingMap['bills-json'],
    },
    {
      id: 'readings',
      icon: '📊',
      title: 'Readings Report',
      description: 'Export meter reading records with unit consumption data.',
      filters: (
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reading Month</label>
            <input className="form-control" type="month" value={readFilters.month} onChange={e => setReadFilters(f => ({ ...f, month: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-control" value={readFilters.status} onChange={e => setReadFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All</option>
              {readingStatuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ),
      onExport: (fmt) => exportReport('readings', readFilters, fmt),
      loading: loadingMap['readings-csv'] || loadingMap['readings-json'],
    },
  ];

  return (
    <>
      <Topbar title="Reports & Export" subtitle="Generate and download filtered reports" />
      <div className="page-content">
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Use filters to narrow down your report scope. Click <strong style={{ color: '#e2e8f0' }}>View JSON</strong> to preview data in browser, or <strong style={{ color: '#f59e0b' }}>Export CSV</strong> to download a spreadsheet-compatible file.
          </div>
        </div>

        <div className="grid-3">
          {reports.map(r => (
            <ReportCard key={r.id} {...r} />
          ))}
        </div>

        <div className="card mt-3">
          <div className="section-title">📈 Export Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { label: 'Customer Fields', items: ['Customer ID', 'Name', 'Email', 'Phone', 'Connection Type', 'Status', 'Meter No.', 'Load', 'Outstanding'] },
              { label: 'Bill Fields', items: ['Bill Number', 'Customer', 'Bill Month', 'Units', 'Total Amount', 'Amount Paid', 'Balance Due', 'Payment Status', 'Due Date'] },
              { label: 'Reading Fields', items: ['Customer', 'Meter No.', 'Previous Reading', 'Current Reading', 'Units Consumed', 'Month', 'Reading Date', 'Status'] },
            ].map(group => (
              <div key={group.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>{group.label}</div>
                {group.items.map(item => (
                  <div key={item} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#10b981', fontSize: 10 }}>✓</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {preview && <DataPreview data={preview} onClose={() => setPreview(null)} />}
    </>
  );
};

export default ReportsPage;
