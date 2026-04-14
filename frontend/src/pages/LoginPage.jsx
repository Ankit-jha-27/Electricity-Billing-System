import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(getDashboardPath(result.role));
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-circle" style={{ width:500,height:500,background:'#f59e0b',top:-100,left:-100 }} />
        <div className="login-circle" style={{ width:400,height:400,background:'#3b82f6',bottom:-80,right:-80 }} />
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <div className="login-title">Welcome Back</div>
          <div className="login-sub">Sign in to PowerBill EBS</div>
        </div>
        {error && <div className="error-msg">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" style={{justifyContent:'center'}} disabled={loading}>
            {loading ? '⏳ Signing in...' : '⚡ Sign In'}
          </button>
        </form>

        <div style={{textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-muted)'}}>
          Don't have an account?{' '}
          <Link to="/register" style={{color:'var(--accent)', textDecoration:'none', fontWeight:600}}>Create one →</Link>
        </div>

        <div style={{textAlign:'center', marginTop:10, fontSize:13}}>
          <Link to="/" style={{color:'var(--text-muted)', textDecoration:'none'}}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;