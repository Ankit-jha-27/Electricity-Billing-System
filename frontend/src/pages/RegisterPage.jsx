import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Field = ({ label, type = 'text', placeholder, value, onChange, error }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input className="form-control" type={type} value={value} onChange={onChange} placeholder={placeholder} style={error ? { borderColor: 'var(--red)' } : {}} />
    {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>⚠ {error}</div>}
  </div>
);

const connTypes = ['Domestic', 'Commercial', 'Industrial', 'Agricultural'];

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', connectionType: 'Domestic', message: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.password)     e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await API.post('/auth/register', { name: form.name, email: form.email, password: form.password, phone: form.phone, connectionType: form.connectionType, message: form.message });
      toast.success('Application submitted! Admin will review and activate your account.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally { setLoading(false); }
  };

  const strength = form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 6 ? 2 : form.password.length > 0 ? 1 : 0;
  const sColors  = ['', 'var(--red)', 'var(--orange)', 'var(--accent)', 'var(--green)'];
  const sLabels  = ['', 'Too short', 'Weak', 'Good', 'Strong'];

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-circle" style={{ width: 500, height: 500, background: '#3b82f6', top: -100, right: -100 }} />
        <div className="login-circle" style={{ width: 350, height: 350, background: '#f59e0b', bottom: -60, left: -80 }} />
      </div>
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <div className="login-title">Apply for Connection</div>
          <div className="login-sub">Submit your electricity connection request</div>
        </div>
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          ℹ️ Once submitted, the admin will review your request, assign a meter, and activate your connection. You can log in to check status.
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Field label="Full Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rajesh Kumar" error={errors.name} />
            <Field label="Phone Number *" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" error={errors.phone} />
          </div>
          <Field label="Email Address *" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" error={errors.email} />
          <div className="form-group">
            <label className="form-label">Connection Type</label>
            <select className="form-control" value={form.connectionType} onChange={e => set('connectionType', e.target.value)}>
              {connTypes.map(t => <option key={t}>{t}</option>)}
            </select>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {form.connectionType === 'Domestic'     && 'Residential homes and apartments'}
              {form.connectionType === 'Commercial'   && 'Shops, offices and businesses'}
              {form.connectionType === 'Industrial'   && 'Factories and industrial units'}
              {form.connectionType === 'Agricultural' && 'Farms and agricultural use'}
            </div>
          </div>
          <div className="form-row">
            <Field label="Password *" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" error={errors.password} />
            <Field label="Confirm Password *" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" error={errors.confirmPassword} />
          </div>
          {form.password && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? sColors[strength] : 'var(--border)', transition: 'background 0.2s' }} />)}
              </div>
              <div style={{ fontSize: 10, color: sColors[strength] }}>{sLabels[strength]}</div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Message to Admin (optional)</label>
            <textarea className="form-control" value={form.message} onChange={e => set('message', e.target.value)} placeholder="Any additional details about your connection request..." rows={2} style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-1" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? '⏳ Submitting...' : '📋 Submit Application'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;