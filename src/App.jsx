import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useErpStore } from './store/useErpStore';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import CashierCheckout from './components/CashierCheckout';
import MasterRecords from './components/MasterRecords';
import WarrantyManager from './components/WarrantyManager';
import ExpiringAccounts from './components/ExpiringAccounts';
import RefundCalculator from './components/RefundCalculator';
import CustomerCrm from './components/CustomerCrm';
import ProductCatalog from './components/ProductCatalog';
import FinanceDashboard from './components/FinanceDashboard';
import ReceiptModal from './components/ReceiptModal';

export default function App() {
  const { activeTab, theme, fetchDb } = useErpStore();

  useEffect(() => {
    fetchDb();
  }, [fetchDb]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'cashier':
        return <CashierCheckout />;
      case 'database':
        return <MasterRecords />;
      case 'expiring':
        return <ExpiringAccounts />;
      case 'warranty':
        return <WarrantyManager />;
      case 'refunds':
        return <RefundCalculator />;
      case 'customers':
        return <CustomerCrm />;
      case 'brain':
        return <ProductCatalog />;
      case 'finance':
        return <FinanceDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-100 dark:bg-black text-slate-800 dark:text-white flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Top Header Navbar */}
      <Navbar />

      {/* Main Layout: Sidebar pinned to Left + Main Workspace Area */}
      <div className="flex flex-1 w-full min-h-[calc(100vh-56px)] min-w-0">
        {/* Left Sidebar (Desktop) + Slide Drawer (Mobile) */}
        <Sidebar />

        {/* Main Content Area with Smooth Page Transition */}
        <main className="flex-1 p-2.5 sm:p-6 pb-24 md:pb-6 overflow-y-auto overflow-x-hidden bg-slate-100/70 dark:bg-black min-h-[calc(100vh-56px)] w-full max-w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Touch-Friendly Bottom App Navigation (Mobile Only) */}
      <BottomNav />

      {/* Thermal Receipt Print Slip Modal */}
      <ReceiptModal />
    </div>
  );
}
