import React from 'react';
import { motion } from 'framer-motion';
import { useErpStore } from '../store/useErpStore';
import { 
  LayoutDashboard,
  Receipt, 
  FileText, 
  ShieldAlert,
  Clock, 
  Calculator,
  Users, 
  Layers, 
  TrendingUp,
  X,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen } = useErpStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cashier', label: 'Cashier Checkout', icon: Receipt },
    { id: 'database', label: 'Master Sales Sheet', icon: FileText },
    { id: 'expiring', label: 'Expiring Soon', icon: Clock },
    { id: 'warranty', label: 'Warranty Register', icon: ShieldAlert },
    { id: 'refunds', label: 'Refund Calculator', icon: Calculator },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'brain', label: 'Product Catalog', icon: Layers },
    { id: 'finance', label: 'Finance Analytics', icon: TrendingUp },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full space-y-6">
      
      {/* Top Header & Links */}
      <div className="space-y-4">
        {/* Mobile Header Close */}
        <div className="px-3 pt-2 md:hidden flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Workspace Menu
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Label */}
        <div className="px-3 text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">
          Main Navigation
        </div>

        {/* Links List (JUST PRO Style with smooth sliding active pill) */}
        <div className="space-y-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`relative w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition-colors duration-150 active:scale-98 ${
                  isActive
                    ? 'text-indigo-700 dark:text-indigo-300 font-extrabold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-purple-50 dark:bg-indigo-950/70 border-l-4 border-indigo-600 rounded-2xl z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative z-10 flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer System Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-center">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-0.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Digital City ERP</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Standalone Operations v2.0</div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Full-Height Left Sidebar (Pinned to Far Left Edge) */}
      <aside className="no-print hidden md:block w-64 pl-4 py-4 pr-3 flex-shrink-0 select-none">
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-3.5 shadow-xs sticky top-20 h-[calc(100vh-96px)] overflow-y-auto transition-colors duration-200">
          {renderNavContent()}
        </div>
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 md:hidden flex">
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-zinc-800 h-full shadow-2xl p-4 overflow-y-auto z-10 transition-colors duration-200">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}
