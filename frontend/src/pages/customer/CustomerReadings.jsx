import React, { useEffect, useState } from 'react';
import Topbar from '../../components/layout/Topbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const CustomerReadings = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get('/customer/readings')
      .then(r => setReadings(r.data.data))
      .catch(() => toast.error('Failed to load readings'))
      .finally(() => setLoading(false));
  }, []);

  const totalUnits = readings.reduce((s, r) => s + (r.unitsConsumed || 0), 0);
  const avgUnits   = readings.length ? Math.round(totalUnits / readings.length) : 0;
  const maxReading = readings.reduce((max, r) => r.unitsConsumed > max ? r.unitsConsumed : max, 0);

  return (
    <>
      <Topbar title="My Readings" subtitle="Meter reading history for your connection" />
      <div className="page-content">

        <div className="grid-3 mb-3">
          {[
            { label: 'Total Readings', value: readings.length, color: '#3b82f6', icon: '📊' },
            { label: 'Average Units / Month', value: `${avgUnits} kWh`, color: '#8b5cf6', icon: '📈' },
            { label: 'Highest Month', value: `${maxReading} kWh`, color: '#f97316', icon: '⚡' },
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

        <div className="card" style={{ padding: 0 }}>
          {loading
            ? <div className="loading-state"><div className="spinner" /></div>
            : readings.length === 0
              ? <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-text">No readings recorded yet</div><div className="empty-sub">Readings will appear here once your meter is read</div></div>
              : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr><th>Month</th><th>Previous Reading</th><th>Current Reading</th><th>Units Consumed</th><th>Date Recorded</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {readings.map((r, i) => {
                        const isHighest = r.unitsConsumed === maxReading && maxReading > 0;
                        return (
                          <tr key={r._id}>
                            <td style={{ fontWeight: 600 }}>{r.readingMonth}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{r.previousReading}</td>
                            <td style={{ fontWeight: 600 }}>{r.currentReading}</td>
                            <td>
                              <span style={{ color: '#10b981', fontWeight: 700 }}>{r.unitsConsumed} kWh</span>
                              {isHighest && <span className="badge badge-orange" style={{ marginLeft: 6, fontSize: 9 }}>Highest</span>}
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.readingDate).toLocaleDateString('en-IN')}</td>
                            <td>
                              <span className={`badge ${r.status === 'Billed' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      </div>
    </>
  );
};

export default CustomerReadings;