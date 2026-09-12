import React from 'react';
import { useErpStore } from '../store/useErpStore';
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const { orders, toggleMobileMenu, isMobileMenuOpen, theme, toggleTheme } = useErpStore();

  const totalNetProfit = orders.reduce((sum, o) => sum + (o.netProfit || 0), 0);

  return (
    <header className="no-print sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 text-white shadow-md transition-colors duration-200">
      <div className="w-full flex items-center justify-between min-w-0">
        
        {/* Left: Mobile Hamburger + Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1.5 sm:p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs xs:text-sm sm:text-lg text-white tracking-tight leading-none uppercase truncate">
                  DIGITAL CITY <span className="text-purple-200 font-medium hidden sm:inline">ERP</span>
                </span>
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-full bg-white/20 text-white border border-white/20 leading-none shrink-0">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-purple-200 font-medium leading-tight hidden xs:block truncate">
                Cashier & Operations Management
              </p>
            </div>
          </div>

        </div>

        {/* Right: Tickers & User Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* Revenue Ticker (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <div className="text-left leading-tight">
              <div className="text-[8px] uppercase font-bold text-purple-200">Net Profit</div>
              <div className="text-xs font-extrabold text-emerald-300 font-mono">
                +{totalNetProfit.toLocaleString()} MMK
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={() => window.location.reload()}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/15"
            title="Refresh App"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-white/20">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white text-purple-700 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              ML
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-extrabold text-white leading-none">maunglenn</div>
              <div className="text-[9px] text-purple-200 font-bold uppercase tracking-wider leading-tight">SUPERADMIN</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
