import React from 'react';
import { motion } from 'framer-motion';
import { useErpStore } from '../store/useErpStore';
import { 
  LayoutDashboard,
  Receipt, 
  FileText, 
  Clock, 
  Menu
} from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, setIsMobileMenuOpen } = useErpStore();

  const primaryTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'cashier', label: 'Cashier', icon: Receipt },
    { id: 'database', label: 'Sales', icon: FileText },
    { id: 'expiring', label: 'Expiry', icon: Clock },
  ];

  const isMoreActive = !primaryTabs.some(t => t.id === activeTab);

  return (
    <div className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-zinc-800 px-2 py-1.5 shadow-lg flex items-center justify-around select-none transition-colors duration-200">
      {primaryTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors active:scale-95 ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeBottomTab"
                className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl z-0"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <div className="relative z-10 p-0.5">
              <Icon className="w-5 h-5" />
            </div>
            <span className="relative z-10 text-[10px] font-semibold leading-none mt-0.5">
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* 5th Button: Menu (Opens Mobile Drawer for all remaining items: Warranty, Refunds, Clients, Catalog, Finance) */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors active:scale-95 ${
          isMoreActive
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
        }`}
      >
        {isMoreActive && (
          <motion.div
            layoutId="activeBottomTab"
            className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl z-0"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <div className="relative z-10 p-0.5">
          <Menu className="w-5 h-5" />
        </div>
        <span className="relative z-10 text-[10px] font-semibold leading-none mt-0.5">
          Menu
        </span>
      </button>
    </div>
  );
}

