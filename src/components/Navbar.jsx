import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';

export default function Navbar() {
  const { orders, toggleMobileMenu, isMobileMenuOpen, theme, toggleTheme, user, logout } = useErpStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalNetProfit = orders.reduce((sum, o) => sum + (o.netProfit || 0), 0);

  return (
    <header className="no-print shrink-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-900 dark:bg-[#09090b] text-slate-100 border-b border-slate-800/90 dark:border-zinc-800 shadow-sm transition-colors duration-200">
      <div className="w-full flex items-center justify-between min-w-0">
        
        {/* Left: Mobile Hamburger + Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs xs:text-sm sm:text-lg text-white tracking-tight leading-none uppercase truncate">
                  CROSSMART <span className="text-indigo-400 font-semibold hidden sm:inline">ERP</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-tight hidden xs:block truncate">
                Cashier & Operations Management
              </p>
            </div>
          </div>

        </div>

        {/* Right: Tickers & User Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* Revenue Ticker (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 dark:bg-zinc-800/60 border border-slate-700/60 dark:border-zinc-700/50">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div className="text-left leading-tight">
              <div className="text-[8px] uppercase font-bold text-slate-400">Net Profit</div>
              <div className="text-xs font-extrabold text-emerald-400 font-mono">
                +{totalNetProfit.toLocaleString()} MMK
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={() => window.location.reload()}
            className="p-1.5 sm:p-2 bg-slate-800/80 hover:bg-slate-700/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 text-slate-300 rounded-xl transition border border-slate-700/60 dark:border-zinc-700/50"
            title="Refresh App"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Profile Avatar & Tap Dropdown */}
          {user ? (
            <div className="relative pl-1.5 sm:pl-2 border-l border-slate-800 dark:border-zinc-800">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0 uppercase transition transform active:scale-95 border border-indigo-500/50 focus:outline-none"
                title={user.name || user.username}
              >
                {user.name ? user.name.slice(0, 2) : 'CM'}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />

                    {/* Popover Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-slate-800 dark:text-white"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {user.name || user.username}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-slate-800">
              <div className="text-xs font-bold text-slate-400">Guest</div>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
