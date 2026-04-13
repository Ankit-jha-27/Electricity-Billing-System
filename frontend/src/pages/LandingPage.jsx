import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '👥', title: 'Customer Management', desc: 'Add, edit and search customers by name, meter number, ID or phone. Track connection type, status and sanctioned load.' },
  { icon: '📊', title: 'Meter Readings', desc: 'Record monthly readings per customer. System auto-calculates units consumed and prevents regressive entries.' },
  { icon: '🧾', title: 'Automated Billing', desc: 'Generate bills instantly using configurable slab-based tariffs. Breakdown includes energy, fixed, FAC and electricity duty charges.' },
  { icon: '💳', title: 'Payment Tracking', desc: 'Record full or partial payments via Cash, UPI, Online or Cheque. Outstanding balances update automatically.' },
  { icon: '💡', title: 'Tariff Configuration', desc: 'Define unit-slab tariffs separately for Domestic, Commercial, Industrial and Agricultural connections.' },
  { icon: '📋', title: 'Reports & Export', desc: 'Filter and export customer, bill and reading data as CSV or JSON. One-click downloads for accounts and audits.' },
];

const stats = [
  { value: '4', label: 'Connection types' },
  { value: 'CSV', label: 'Export format' },
  { value: '100%', label: 'Web-based' },
  { value: 'MERN', label: 'Tech stack' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17 }}>PowerBill</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', marginLeft: 4 }}>EBS</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/login')} style={{ padding: '8px 18px', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}
            onMouseOver={e => e.target.style.borderColor = '#f59e0b'}
            onMouseOut={e => e.target.style.borderColor = 'var(--border-light)'}
          >Sign In</button>
          <button onClick={() => navigate('/register')} style={{ padding: '8px 18px', background: '#f59e0b', border: 'none', borderRadius: 8, color: '#0a0e1a', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'background 0.2s' }}
            onMouseOver={e => e.target.style.background = '#fbbf24'}
            onMouseOut={e => e.target.style.background = '#f59e0b'}
          >Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '90px 40px 80px', textAlign: 'center' }}>
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, left: '10%', width: 280, height: 280, background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 40, right: '8%', width: 260, height: 260, background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 28, fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
            ⚡ Electricity Billing System — MERN Stack
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 22, background: 'linear-gradient(135deg, #f1f5f9 30%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Manage Electricity<br />Billing the Smart Way
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
            A complete billing system for utility boards — handle customer connections, meter readings, automated bill generation, payments and reports from one dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '13px 28px', background: '#f59e0b', border: 'none', borderRadius: 10, color: '#0a0e1a', cursor: 'pointer', fontSize: 15, fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseOver={e => { e.currentTarget.style.background = '#fbbf24'; e.currentTarget.style.boxShadow = '0 0 28px rgba(245,158,11,0.35)'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.boxShadow = 'none'; }}
            >Create Account <span>→</span></button>
            <button onClick={() => navigate('/login')} style={{ padding: '13px 28px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 10, color: 'var(--text)', cursor: 'pointer', fontSize: 15, fontWeight: 500, transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#f59e0b'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text)'; }}
            >Sign In to Dashboard</button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '28px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none', padding: '0 20px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 34, fontWeight: 800, marginBottom: 12 }}>Everything you need</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>From customer onboarding to bill collection — the full workflow in one system.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', transition: 'border-color 0.2s, transform 0.2s', cursor: 'default' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '72px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginBottom: 10 }}>How it works</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Four simple steps from connection to collection</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
            {[
              { step: '01', label: 'Add Customer', desc: 'Register meter number, connection type and sanctioned load' },
              { step: '02', label: 'Record Reading', desc: 'Enter monthly meter reading — units consumed auto-calculated' },
              { step: '03', label: 'Generate Bill', desc: 'System applies tariff slabs and creates itemised bill' },
              { step: '04', label: 'Collect Payment', desc: 'Record payment, update balance, track overdue accounts' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0 20px', textAlign: 'center', position: 'relative' }}>
                {i < 3 && <div style={{ position: 'absolute', right: 0, top: 22, width: 1, height: 28, background: 'var(--border)' }} />}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: '#f59e0b' }}>{s.step}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, marginBottom: 14 }}>Ready to get started?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>Create your account in seconds and start managing electricity billing for your utility connections.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '12px 26px', background: '#f59e0b', border: 'none', borderRadius: 10, color: '#0a0e1a', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
              onMouseOver={e => e.target.style.background = '#fbbf24'}
              onMouseOut={e => e.target.style.background = '#f59e0b'}
            >Create Free Account</button>
            <button onClick={() => navigate('/login')} style={{ padding: '12px 26px', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 10, color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
              onMouseOver={e => e.target.style.color = '#f59e0b'}
              onMouseOut={e => e.target.style.color = 'var(--text-dim)'}
            >Already have account?</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>PowerBill EBS</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date().toDateString()}</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign In</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/register')}>Register</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;