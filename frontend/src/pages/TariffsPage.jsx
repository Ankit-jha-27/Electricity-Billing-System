import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../components/layout/Topbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

const connTypes = ['Domestic', 'Commercial', 'Industrial', 'Agricultural'];

const emptyForm = {
  name: '',
  connectionType: 'Domestic',
  slabs: [{ fromUnit: 0, toUnit: 100, ratePerUnit: '' }],
  fixedCharge: '',
  fuelAdjustmentCharge: '',
  electricityDutyPercent: '',
  isActive: true,
};

const TariffModal = ({ tariff, onClose, onSaved }) => {
  const [form, setForm] = useState(tariff
    ? { ...tariff, slabs: tariff.slabs.map(s => ({ ...s })) }
    : { ...emptyForm, slabs: [{ fromUnit: 0, toUnit: 100, ratePerUnit: '' }] }
  );
  const [saving, setSaving] = useState(false);

  const setSlab = (i, k, v) => {
    const slabs = [...form.slabs];
    slabs[i] = { ...slabs[i], [k]: v === '' ? '' : Number(v) };
    setForm(f => ({ ...f, slabs }));
  };
  const addSlab = () => {
    const last = form.slabs[form.slabs.length - 1];
    setForm(f => ({ ...f, slabs: [...f.slabs, { fromUnit: last.toUnit || 0, toUnit: '', ratePerUnit: '' }] }));
  };
  const removeSlab = (i) => setForm(f => ({ ...f, slabs: f.slabs.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (tariff) await API.put(`/tariffs/${tariff._id}`, form);
      else await API.post('/tariffs', form);
      toast.success(tariff ? 'Tariff updated!' : 'Tariff created!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving tariff'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">💡 {tariff ? 'Edit Tariff' : 'New Tariff'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tariff Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Connection Type *</label>
                <select className="form-control" value={form.connectionType} onChange={e => setForm(f => ({ ...f, connectionType: e.target.value }))}>
                  {connTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 0, fontSize: 13 }}>Unit Slabs</div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSlab}>+ Add Slab</button>
            </div>
            {form.slabs.map((slab, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">From Unit</label>
                  <input className="form-control" type="number" value={slab.fromUnit} onChange={e => setSlab(i, 'fromUnit', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">To Unit (blank=∞)</label>
                  <input className="form-control" type="number" value={slab.toUnit ?? ''} onChange={e => setSlab(i, 'toUnit', e.target.value === '' ? null : e.target.value)} placeholder="∞" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rate / Unit (₹)</label>
                  <input className="form-control" type="number" step="0.01" value={slab.ratePerUnit} onChange={e => setSlab(i, 'ratePerUnit', e.target.value)} required />
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSlab(i)} disabled={form.slabs.length === 1}>✕</button>
              </div>
            ))}
            <div className="divider" />
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Fixed Charge / Month (₹)</label>
                <input className="form-control" type="number" step="0.01" value={form.fixedCharge} onChange={e => setForm(f => ({ ...f, fixedCharge: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Adj. Charge / Unit (₹)</label>
                <input className="form-control" type="number" step="0.01" value={form.fuelAdjustmentCharge} onChange={e => setForm(f => ({ ...f, fuelAdjustmentCharge: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Electricity Duty (%)</label>
                <input className="form-control" type="number" step="0.1" value={form.electricityDutyPercent} onChange={e => setForm(f => ({ ...f, electricityDutyPercent: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <span className="form-label" style={{ marginBottom: 0 }}>Active Tariff</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (tariff ? 'Update' : 'Create Tariff')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TariffsPage = () => {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchTariffs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/tariffs');
      setTariffs(data.data);
    } catch { toast.error('Failed to load tariffs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTariffs(); }, [fetchTariffs]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tariff?')) return;
    try { await API.delete(`/tariffs/${id}`); toast.success('Tariff deleted'); fetchTariffs(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const typeColor = { Domestic: '#3b82f6', Commercial: '#8b5cf6', Industrial: '#f97316', Agricultural: '#10b981' };

  return (
    <>
      <Topbar title="Tariff Management" subtitle="Configure electricity rate slabs"
        actions={<button className="btn btn-primary" onClick={() => setModal('new')}>💡 New Tariff</button>} />
      <div className="page-content">
        {loading ? <div className="loading-state"><div className="spinner" /></div>
          : tariffs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💡</div><div className="empty-text">No tariffs configured</div></div>
          ) : (
            <div className="grid-2">
              {tariffs.map(t => (
                <div key={t._id} className="card" style={{ borderLeft: `3px solid ${typeColor[t.connectionType] || '#64748b'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.connectionType}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${t.isActive ? 'badge-green' : 'badge-gray'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 8 }}>Unit Slabs</div>
                    {t.slabs.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #1e2d45' }}>
                        <span style={{ color: '#94a3b8' }}>{s.fromUnit} – {s.toUnit ?? '∞'} units</span>
                        <span style={{ color: typeColor[t.connectionType], fontWeight: 700 }}>₹{s.ratePerUnit}/unit</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                    <span>Fixed: <strong style={{ color: '#e2e8f0' }}>₹{t.fixedCharge}/mo</strong></span>
                    <span>FAC: <strong style={{ color: '#e2e8f0' }}>₹{t.fuelAdjustmentCharge}/unit</strong></span>
                    <span>Duty: <strong style={{ color: '#e2e8f0' }}>{t.electricityDutyPercent}%</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal(t)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {modal && (
        <TariffModal
          tariff={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchTariffs(); }}
        />
      )}
    </>
  );
};

export default TariffsPage;