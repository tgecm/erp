import React, { useState, useEffect } from 'react';
import { useErpStore } from '../store/useErpStore';
import {
  Lock, User, Mail, ArrowRight, AlertCircle, CheckCircle2,
  RefreshCw, Clock, Loader2, Eye, EyeOff, ShieldCheck,
  ChevronLeft, ShoppingBag, BarChart3, Users, Package
} from 'lucide-react';

const API_BASE = typeof window !== 'undefined'
  ? (window.location.port === '3000' ? 'http://localhost:4000/api' : '/api')
  : '/api';

/* ═══════════════════════════════════════════════════
   MAIN LOGIN PAGE — Full-screen, split layout
═══════════════════════════════════════════════════ */
export default function LoginModal() {
  const { login, user } = useErpStore();
  const [view, setView] = useState('login');

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);

  const [verEmail, setVerEmail]   = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft]   = useState(180);

  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  if (user) return null;

  /* ── Countdown ── */
  useEffect(() => {
    if (view !== 'pending_verification' || !expiresAt) return;
    const t = setInterval(() => {
      const r = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(r);
      if (r <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [view, expiresAt]);

  /* ── Poll verification ── */
  useEffect(() => {
    if (view !== 'pending_verification' || !verEmail) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/check-verification-status?email=${encodeURIComponent(verEmail)}`);
        const d = await res.json();
        if (d.isVerified) { clearInterval(t); setSuccess('Verified! Logging in…'); setTimeout(() => login(verEmail, password), 900); }
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [view, verEmail, password, login]);

  const clear = () => { setError(''); setSuccess(''); };
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  /* ── Handlers ── */
  const handleLogin = async e => {
    e.preventDefault(); clear();
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const r = await login(email.trim(), password);
    setLoading(false);
    if (!r.success) {
      if (r.requiresVerification) { setVerEmail(r.email || email.trim()); setView('pending_verification'); setExpiresAt(Date.now()+180000); }
      else setError(r.error || 'Invalid credentials.');
    }
  };

  const handleRegister = async e => {
    e.preventDefault(); clear();
    if (!email.trim() || !password) { setError('Email and password required.'); return; }
    if (password.length < 6) { setError('Password must be 6+ characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const d = await res.json(); setLoading(false);
      if (!res.ok || !d.success) { setError(d.error || 'Registration failed.'); return; }
      setVerEmail(email.trim()); setExpiresAt(d.expiresAt || Date.now()+180000); setTimeLeft(180); setView('pending_verification');
    } catch { setLoading(false); setError('Connection error.'); }
  };

  const handleResend = async () => {
    clear(); setResending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verEmail }),
      });
      const d = await res.json(); setResending(false);
      if (!res.ok || !d.success) { setError(d.error || 'Failed.'); return; }
      setExpiresAt(d.expiresAt || Date.now()+180000); setTimeLeft(180); setSuccess('New link sent!');
    } catch { setResending(false); setError('Failed to resend.'); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes subtlePulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0) }
          10% { transform: translate(-2%, -2%) }
          30% { transform: translate(1%, -3%) }
          50% { transform: translate(-1%, 2%) }
          70% { transform: translate(3%, 1%) }
          90% { transform: translate(2%, -1%) }
        }
        .login-page * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-page input::placeholder { color: rgba(120,113,108,0.5); }
        .login-page input:focus::placeholder { color: rgba(120,113,108,0.3); }
      `}</style>

      <div className="login-page" style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', fontFamily: "'Inter', system-ui, sans-serif",
        background: '#0c0a09',
      }}>

        {/* ═══════════════════════════════════════
            LEFT PANEL — Branding
        ═══════════════════════════════════════ */}
        <div style={{
          flex: '0 0 45%', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px',
          background: 'linear-gradient(165deg, #1c1917 0%, #0c0a09 40%, #1a0f0a 100%)',
        }}
          className="brand-panel"
        >
          {/* Subtle warm ambient glow */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-30%',
            width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', left: '-20%',
            width: '60%', height: '60%',
            background: 'radial-gradient(circle, rgba(161,98,7,0.06) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          {/* Film grain texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            animation: 'grain 8s steps(10) infinite',
          }} />

          {/* Top: Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShoppingBag style={{ width: '20px', height: '20px', color: '#fef3c7' }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#a8a29e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                CrossMart
              </span>
            </div>
          </div>

          {/* Center: Hero text */}
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 700,
              color: '#fafaf9', lineHeight: 1.15, letterSpacing: '-0.02em',
              marginBottom: '24px',
            }}>
              Manage your
              <br />
              shops with
              <br />
              <span style={{ color: '#d97706' }}>clarity.</span>
            </h1>
            <p style={{
              fontSize: '15px', lineHeight: 1.8, color: '#78716c',
              fontWeight: 400, maxWidth: '340px',
            }}>
              One dashboard for cashier operations, inventory tracking,
              customer insights, and financial reporting across all your stores.
            </p>
          </div>

          {/* Bottom: Feature pills */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { icon: BarChart3, text: 'Live Analytics' },
              { icon: Users,    text: 'CRM' },
              { icon: Package,  text: 'Inventory' },
              { icon: ShoppingBag, text: 'POS' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '8px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '100px',
                fontSize: '12px', fontWeight: 500, color: '#78716c',
              }}>
                <Icon style={{ width: '13px', height: '13px', color: '#a16207' }} />
                {text}
              </div>
            ))}
          </div>

          {/* Vertical line accent */}
          <div style={{
            position: 'absolute', right: 0, top: '15%', bottom: '15%', width: '1px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(168,162,158,0.12) 50%, transparent 100%)',
          }} />
        </div>

        {/* ═══════════════════════════════════════
            RIGHT PANEL — Forms
        ═══════════════════════════════════════ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: '48px',
          background: '#0c0a09',
          overflowY: 'auto',
          position: 'relative',
        }}>
          <div style={{ width: '100%', maxWidth: '380px', animation: 'fadeIn 0.4s ease' }}>

            {/* ── LOGIN ── */}
            {view === 'login' && (
              <div key="login">
                <div style={{ marginBottom: '36px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fafaf9', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                    Welcome back
                  </h2>
                  <p style={{ fontSize: '14px', color: '#78716c', fontWeight: 400 }}>
                    Sign in to your account to continue
                  </p>
                </div>

                <AlertMsg type="error" msg={error} />
                <AlertMsg type="ok" msg={success} />

                <form onSubmit={handleLogin}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    <Field
                      id="li-em" label="Email or Username" icon={User} type="text"
                      value={email} onChange={setEmail} required
                    />
                    <Field
                      id="li-pw" label="Password" icon={Lock}
                      type={showPw ? 'text' : 'password'}
                      value={password} onChange={setPassword} required
                      right={<EyeBtn on={showPw} flip={() => setShowPw(v=>!v)} />}
                    />
                  </div>

                  <Btn loading={loading} text="Sign In" loadingText="Signing in…" />
                </form>

                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                  <span style={{ fontSize: '13px', color: '#57534e' }}>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => { setView('register'); clear(); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#d97706', fontWeight: 600, fontSize: '13px',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Create one
                    </button>
                  </span>
                </div>
              </div>
            )}

            {/* ── REGISTER ── */}
            {view === 'register' && (
              <div key="register" style={{ animation: 'fadeIn 0.35s ease' }}>
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fafaf9', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                    Create account
                  </h2>
                  <p style={{ fontSize: '14px', color: '#78716c', fontWeight: 400 }}>
                    Set up your credentials to get started
                  </p>
                </div>

                <AlertMsg type="error" msg={error} />

                <form onSubmit={handleRegister}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    <Field id="rg-nm" label="Full Name" icon={User} value={name} onChange={setName} />
                    <Field id="rg-em" label="Email Address" icon={Mail} type="email" value={email} onChange={setEmail} required />
                    <Field
                      id="rg-pw" label="Password" icon={Lock}
                      type={showPw ? 'text' : 'password'}
                      value={password} onChange={setPassword} required
                      right={<EyeBtn on={showPw} flip={() => setShowPw(v=>!v)} />}
                    />
                    <Field
                      id="rg-cp" label="Confirm Password" icon={ShieldCheck}
                      type={showCpw ? 'text' : 'password'}
                      value={confirm} onChange={setConfirm} required
                      right={<EyeBtn on={showCpw} flip={() => setShowCpw(v=>!v)} />}
                    />
                  </div>

                  <Btn loading={loading} text="Create Account" loadingText="Sending verification…" />
                </form>

                <div style={{ textAlign: 'center', marginTop: '28px' }}>
                  <span style={{ fontSize: '13px', color: '#57534e' }}>
                    Already have an account?{' '}
                    <button type="button" onClick={() => { setView('login'); clear(); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#d97706', fontWeight: 600, fontSize: '13px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Sign in
                    </button>
                  </span>
                </div>
              </div>
            )}

            {/* ── VERIFICATION ── */}
            {view === 'pending_verification' && (
              <div key="verify" style={{ animation: 'fadeIn 0.35s ease' }}>
                {/* Mail icon */}
                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'rgba(217,119,6,0.1)',
                    border: '1px solid rgba(217,119,6,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <Mail style={{ width: '32px', height: '32px', color: '#d97706' }} />
                    {/* Live ping */}
                    <div style={{
                      position: 'absolute', top: '2px', right: '2px',
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: '#16a34a',
                      border: '2.5px solid #0c0a09',
                    }}>
                      <div style={{
                        position: 'absolute', inset: '-3px', borderRadius: '50%',
                        background: 'rgba(22,163,74,0.4)',
                        animation: 'subtlePulse 1.5s ease-in-out infinite',
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fafaf9', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                    Check your email
                  </h2>
                  <p style={{ fontSize: '13.5px', color: '#78716c', lineHeight: 1.7, marginBottom: '14px' }}>
                    We sent a verification link to
                  </p>
                  <div style={{
                    display: 'inline-block', padding: '6px 16px',
                    background: 'rgba(217,119,6,0.08)',
                    border: '1px solid rgba(217,119,6,0.18)',
                    borderRadius: '8px',
                    fontSize: '13.5px', fontWeight: 600, color: '#d97706',
                  }}>
                    {verEmail}
                  </div>
                </div>

                {/* Instruction card */}
                <div style={{
                  padding: '18px 20px', marginBottom: '20px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <CheckCircle2 style={{ width: '15px', height: '15px', color: '#16a34a', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#a8a29e', fontWeight: 500 }}>
                      Click <strong style={{ color: '#d97706' }}>"Verify My Email"</strong> in your inbox
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#57534e' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      Expires in
                    </div>
                    <span style={{
                      fontFamily: 'monospace', fontWeight: 700, fontSize: '15px',
                      color: timeLeft <= 30 ? '#ef4444' : '#d97706',
                    }}>
                      {fmt(timeLeft)}
                    </span>
                  </div>
                </div>

                <AlertMsg type="error" msg={error} />
                <AlertMsg type="ok" msg={success} />

                {/* Listening */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', marginBottom: '20px',
                  fontSize: '12px', color: '#78716c', fontWeight: 500,
                }}>
                  <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite', color: '#a16207' }} />
                  Waiting for verification…
                </div>

                {/* Buttons */}
                <button type="button" onClick={handleResend}
                  disabled={resending || timeLeft > 120}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', cursor: (resending || timeLeft > 120) ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 600,
                    color: (resending || timeLeft > 120) ? '#44403c' : '#a8a29e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s ease',
                    marginBottom: '12px',
                  }}
                >
                  {resending
                    ? <><Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> Resending…</>
                    : <><RefreshCw style={{ width: '13px', height: '13px' }} /> Resend email</>
                  }
                </button>
                <button type="button" onClick={() => { setView('login'); clear(); }}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 500, color: '#57534e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    padding: '8px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a8a29e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#57534e'}
                >
                  <ChevronLeft style={{ width: '14px', height: '14px' }} /> Back to sign in
                </button>
              </div>
            )}

          </div>

          {/* Footer */}
          <div style={{
            position: 'absolute', bottom: '24px', left: 0, right: 0,
            textAlign: 'center', fontSize: '11px', color: '#44403c',
            fontWeight: 500, letterSpacing: '0.04em',
          }}>
            CrossMart ERP &nbsp;·&nbsp; Internal System
          </div>
        </div>

        {/* ── MOBILE: hide left panel ── */}
        <style>{`
          @media (max-width: 768px) {
            .brand-panel { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}


/* ═══════════════════════════════════════════════════
   FIELD — Clean input with label above
═══════════════════════════════════════════════════ */
function Field({ id, label, icon: Icon, type = 'text', value, onChange, required, right }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label htmlFor={id} style={{
        display: 'block', fontSize: '12px', fontWeight: 600,
        color: '#78716c', marginBottom: '6px',
        letterSpacing: '0.02em',
      }}>
        {label}
      </label>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        border: `1px solid ${focused ? 'rgba(217,119,6,0.5)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '10px',
        background: focused ? 'rgba(217,119,6,0.04)' : 'rgba(255,255,255,0.025)',
        transition: 'all 0.2s ease',
        boxShadow: focused ? '0 0 0 3px rgba(217,119,6,0.08)' : 'none',
      }}>
        <div style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#d97706' : '#57534e',
          display: 'flex', transition: 'color 0.2s ease',
          pointerEvents: 'none',
        }}>
          <Icon style={{ width: '15px', height: '15px' }} />
        </div>
        <input
          id={id} type={type} value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, width: '100%',
            background: 'none', border: 'none', outline: 'none',
            padding: '12px 14px 12px 42px',
            fontSize: '14px', fontWeight: 500,
            color: '#e7e5e4',
            fontFamily: "'Inter', system-ui, sans-serif",
            caretColor: '#d97706',
          }}
          autoComplete="off"
        />
        {right && <div style={{ paddingRight: '12px', display: 'flex' }}>{right}</div>}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   BTN — Submit button
═══════════════════════════════════════════════════ */
function Btn({ loading, text, loadingText }) {
  const [hov, setHov] = useState(false);

  return (
    <button type="submit" disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '13px 20px',
        border: 'none', borderRadius: '10px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '14px', fontWeight: 600,
        color: '#fef3c7',
        background: loading
          ? 'rgba(161,98,7,0.4)'
          : hov
            ? 'linear-gradient(135deg, #b45309, #d97706)'
            : '#92400e',
        boxShadow: hov && !loading
          ? '0 4px 20px rgba(217,119,6,0.25)'
          : '0 1px 3px rgba(0,0,0,0.4)',
        transform: hov && !loading ? 'translateY(-1px)' : 'none',
        transition: 'all 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}
    >
      {loading
        ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> {loadingText}</>
        : <>{text} <ArrowRight style={{ width: '15px', height: '15px' }} /></>
      }
    </button>
  );
}


/* ═══════════════════════════════════════════════════
   Eye toggle + Alert
═══════════════════════════════════════════════════ */
function EyeBtn({ on, flip }) {
  return (
    <button type="button" onClick={flip} tabIndex={-1} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: '#57534e', display: 'flex', padding: '2px',
      transition: 'color 0.15s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.color = '#a8a29e'}
      onMouseLeave={e => e.currentTarget.style.color = '#57534e'}
    >
      {on ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
    </button>
  );
}

function AlertMsg({ type, msg }) {
  if (!msg) return null;
  const isErr = type === 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 14px', marginBottom: '16px',
      background: isErr ? 'rgba(239,68,68,0.07)' : 'rgba(22,163,74,0.07)',
      border: `1px solid ${isErr ? 'rgba(239,68,68,0.2)' : 'rgba(22,163,74,0.2)'}`,
      borderRadius: '10px',
      fontSize: '13px', fontWeight: 500, color: isErr ? '#fca5a5' : '#86efac',
      animation: isErr ? 'shake 0.3s ease' : 'fadeIn 0.25s ease',
      lineHeight: 1.5,
    }}>
      {isErr
        ? <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0, marginTop: '1px' }} />
        : <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0, marginTop: '1px' }} />}
      <span>{msg}</span>
    </div>
  );
}
