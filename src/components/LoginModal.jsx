import React, { useState, useEffect } from 'react';
import { useErpStore } from '../store/useErpStore';
import { 
  Lock, 
  User, 
  Mail,
  ArrowRight, 
  AlertCircle,
  Store,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';

const API_BASE = typeof window !== 'undefined'
  ? (window.location.port === '3000' ? 'http://localhost:4000/api' : '/api')
  : '/api';

export default function LoginModal() {
  const { login, user } = useErpStore();
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'pending_verification'
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Verification State
  const [verificationEmail, setVerificationEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (user) return null; // Hide modal if already logged in

  // --- Countdown Timer Effect ---
  useEffect(() => {
    let timer = null;
    if (viewMode === 'pending_verification' && expiresAt) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewMode, expiresAt]);

  // --- Polling Verification Status Effect ---
  useEffect(() => {
    let pollInterval = null;
    if (viewMode === 'pending_verification' && verificationEmail) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/auth/check-verification-status?email=${encodeURIComponent(verificationEmail)}`);
          const data = await res.json();

          if (data.isVerified) {
            clearInterval(pollInterval);
            setSuccessMsg('Email verified! Logging into dashboard...');
            // Automatically log in with saved password
            setTimeout(async () => {
              await login(verificationEmail, password);
            }, 1000);
          }
        } catch (err) {
          console.error('[Polling Error]:', err);
        }
      }, 3000); // Check every 3 seconds
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [viewMode, verificationEmail, password, login]);

  // --- Handle Login Submission ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Please enter both email/username and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      if (result.requiresVerification) {
        setVerificationEmail(result.email || email.trim());
        setViewMode('pending_verification');
        setExpiresAt(Date.now() + 3 * 60 * 1000);
        setError('Please click "Verify My Email" in your inbox to complete sign in.');
      } else {
        setError(result.error || 'Invalid credentials or connection error.');
      }
    }
  };

  // --- Handle Registration Submission ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Please provide an email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setVerificationEmail(email.trim());
      setExpiresAt(data.expiresAt || (Date.now() + 3 * 60 * 1000));
      setTimeLeft(180);
      setViewMode('pending_verification');
    } catch (err) {
      setLoading(false);
      setError('Connection error. Failed to reach server.');
    }
  };

  // --- Handle Resend Email ---
  const handleResendEmail = async () => {
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      });

      const data = await res.json();
      setResending(false);

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to resend email.');
        return;
      }

      setExpiresAt(data.expiresAt || (Date.now() + 3 * 60 * 1000));
      setTimeLeft(180);
      setSuccessMsg('A new 3-minute verification email has been sent!');
    } catch (err) {
      setResending(false);
      setError('Failed to resend verification email.');
    }
  };

  // Format Timer mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 relative transition-all duration-300">
        
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 text-white text-center space-y-2 relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner mb-1">
            <Store className="w-6 h-6 text-purple-200" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">
            CROSSMART <span className="text-purple-200 font-medium">ERP</span>
          </h1>
          <p className="text-xs text-purple-100 font-medium">
            Cashier & Multi-Shop Operations System
          </p>
        </div>

        {/* View 1: LOGIN FORM */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs font-bold">
              <button
                type="button"
                className="flex-1 py-2 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('register'); setError(''); }}
                className="flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 transition"
              >
                Create Account
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email / Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email or Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or Username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center space-x-2"><Loader2 className="w-4 h-4 animate-spin" /> <span>Signing In...</span></span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

        {/* View 2: REGISTER FORM */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setViewMode('login'); setError(''); }}
                className="flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 transition"
              >
                Sign In
              </button>
              <button
                type="button"
                className="flex-1 py-2 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
              >
                Create Account
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center space-x-2"><Loader2 className="w-4 h-4 animate-spin" /> <span>Sending Verification...</span></span>
              ) : (
                <>
                  <span>Create Account & Send Verification Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

        {/* View 3: EMAIL VERIFICATION WAITING SCREEN */}
        {viewMode === 'pending_verification' && (
          <div className="p-6 space-y-5 text-center">

            {/* Glowing Email Icon */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 mx-auto">
              <Mail className="w-8 h-8 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Check Your Email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                We sent a verification email to:
              </p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 py-1.5 px-3 rounded-xl inline-block border border-indigo-200 dark:border-indigo-800">
                {verificationEmail}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-left space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Open your inbox & click <strong className="text-indigo-600 dark:text-indigo-400">"Verify My Email"</strong></span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Link Expires In:</span>
                </span>
                <span className={`font-mono font-black text-sm ${timeLeft <= 30 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Listening Status Animation */}
            <div className="flex items-center justify-center space-x-2 text-xs text-indigo-500 font-bold py-1">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Waiting for your email verification click...</span>
            </div>

            {/* Messages & Alerts */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {successMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending || (timeLeft > 120)} // Allow resend after 1 minute or when expired
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition disabled:opacity-40"
              >
                {resending ? (
                  <span>Resending Email...</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setViewMode('login'); setError(''); setSuccessMsg(''); }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
              >
                Back to Sign In
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
