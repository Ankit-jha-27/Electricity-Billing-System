import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

// Defined OUTSIDE RegisterPage so its identity never changes between renders.
// If defined inside, every keystroke recreates it as a new component type,
// causing React to unmount+remount the input and lose focus after each character.
const Field = ({ label, type = 'text', placeholder, value, onChange, error }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input
      className="form-control"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={error ? { borderColor: 'var(--red)' } : {}}
    />
    {error && (
      <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>⚠ {error}</div>
    )}
  </div>
);

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'operator' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await API.post('/auth/register', { name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 6 ? 2 : form.password.length > 0 ? 1 : 0;
  const strengthColors = ['', 'var(--red)', 'var(--orange)', 'var(--accent)', 'var(--green)'];
  const strengthLabels = ['', 'Too short', 'Weak', 'Good', 'Strong'];

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-circle" style={{ width: 500, height: 500, background: '#3b82f6', top: -100, right: -100 }} />
        <div className="login-circle" style={{ width: 350, height: 350, background: '#f59e0b', bottom: -60, left: -80 }} />
      </div>

      <div className="login-card" style={{ maxWidth: 460 }}>
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <div className="login-title">Create Account</div>
          <div className="login-sub">Join PowerBill Electricity Billing System</div>
        </div>

        <form onSubmit={handleSubmit}>
          <Field
            label="Full Name *"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            error={errors.name}
          />

          <Field
            label="Email Address *"
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
          />

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="operator">Operator — can manage customers, readings, bills</option>
              <option value="admin">Admin — full access including user management</option>
              <option value="viewer">Viewer — read-only access</option>
            </select>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {form.role === 'admin'    && '🔑 Admin has full system access including reports and tariff config.'}
              {form.role === 'operator' && '⚙️ Operators can manage day-to-day billing operations.'}
              {form.role === 'viewer'   && '👁 Viewers can browse data but cannot make changes.'}
            </div>
          </div>

          <div className="form-row">
            <Field
              label="Password *"
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min 6 characters"
              error={errors.password}
            />
            <Field
              label="Confirm Password *"
              type="password"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              placeholder="Repeat password"
              error={errors.confirmPassword}
            />
          </div>

          {/* Password strength bar */}
          {form.password && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--border)', transition: 'background 0.2s' }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: strengthColors[strength] }}>
                {strengthLabels[strength]}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full mt-1"
            style={{ justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? '⏳ Creating account...' : '✓ Create Account'}
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