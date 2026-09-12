import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Store
} from 'lucide-react';

export default function LoginModal() {
  const { login, user } = useErpStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return null; // If already authenticated, do not show login modal

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both login credentials.');
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials or connection error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 relative transition-colors duration-200">
        
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

        {/* Combined Unified Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Username / Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email or Username"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
