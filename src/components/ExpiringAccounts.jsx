import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { AlertTriangle, Clock, Search, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export default function ExpiringAccounts() {
  const { orders, getRemainingWarrantyDays, toggleReminded, extendSubscription } = useErpStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [extendingOrder, setExtendingOrder] = useState(null);
  const [extCreds, setExtCreds] = useState({ accountEmail: '', accountPassword: '', activationUrl: '', note: '' });

  const expiringOrders = orders.filter((o) => {
    const rem = getRemainingWarrantyDays(o.endDate);
    return rem > 0 && rem <= 7;
  });

  const filteredExpiringOrders = expiringOrders.filter(o =>
    !searchQuery ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.accountEmail && o.accountEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenExtend = (order) => {
    setExtendingOrder(order);
    setExtCreds({
      accountEmail: order.accountEmail || '',
      accountPassword: order.accountPassword || '',
      activationUrl: order.activationUrl || '',
      note: 'Monthly subscription account replacement',
    });
  };

  const handleSaveExtend = (e) => {
    e.preventDefault();
    if (!extendingOrder) return;
    extendSubscription(extendingOrder.id, extCreds);
    setExtendingOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Urgent Expiry Alerts (Within 7 Days)</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {expiringOrders.length} Accounts Urgent
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Accounts requiring customer renewal notifications & monthly replacement credentials within 7 days.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expiring accounts..."
              className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500 w-44 sm:w-56 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Urgent Cards Grid View */}
      {filteredExpiringOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-slate-400 font-medium text-xs">
          {expiringOrders.length === 0 
            ? "🎉 No accounts expiring within 7 days! All active warranties are safe." 
            : "No expiring accounts match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredExpiringOrders.map((o) => {
            const rem = getRemainingWarrantyDays(o.endDate);
            return (
              <div key={o.id} className="bg-white dark:bg-[#09090b] border border-amber-300 dark:border-amber-800/80 p-4 rounded-2xl space-y-3 shadow-xs flex flex-col justify-between hover:border-amber-500 transition">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{o.productName}</span>
                    <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0 font-mono animate-pulse">
                      {rem} Days Left
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-900 dark:text-white font-extrabold">{o.customerName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{o.contactInfo}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-[11px] font-mono space-y-1">
                    <div className="text-purple-600 dark:text-purple-400 font-bold truncate">Login: {o.accountEmail || 'Link'}</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold">Pass: {o.accountPassword || '-'}</div>
                    <div className="text-slate-400 text-[10px]">End Date: {o.endDate}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!o.isReminded}
                      onChange={() => toggleReminded(o.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <span className="font-bold text-[11px]">{o.isReminded ? '✅ Reminded' : 'Mark Reminded'}</span>
                  </label>

                  <button
                    onClick={() => handleOpenExtend(o)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition shadow-xs flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>+ Extend 30D</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Extension / Renewal Modal */}
      {extendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-fade-in-scale">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Issue Monthly Renewal for {extendingOrder.customerName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Update replacement login credentials. Old credentials will be archived automatically.
            </p>

            <form onSubmit={handleSaveExtend} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">New Account Email</label>
                <input
                  type="text"
                  value={extCreds.accountEmail}
                  onChange={(e) => setExtCreds({ ...extCreds, accountEmail: e.target.value })}
                  placeholder="new_month_email@gmail.com"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">New Account Password</label>
                <input
                  type="text"
                  value={extCreds.accountPassword}
                  onChange={(e) => setExtCreds({ ...extCreds, accountPassword: e.target.value })}
                  placeholder="NewPassword#2026"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Renewal Notes</label>
                <input
                  type="text"
                  value={extCreds.note}
                  onChange={(e) => setExtCreds({ ...extCreds, note: e.target.value })}
                  placeholder="Issued Month replacement account"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setExtendingOrder(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold"
                >
                  Save & Extend 30 Days
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
