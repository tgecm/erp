import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { ShieldAlert, AlertTriangle, Clock, Search, CheckCircle2, RefreshCw } from 'lucide-react';

export default function WarrantyManager() {
  const { orders, getRemainingWarrantyDays, toggleReminded, extendSubscription } = useErpStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [extendingOrder, setExtendingOrder] = useState(null);
  const [extCreds, setExtCreds] = useState({ accountEmail: '', accountPassword: '', activationUrl: '', note: '' });

  const expiringOrders = orders.filter((o) => {
    const rem = getRemainingWarrantyDays(o.endDate);
    return rem > 0 && rem <= 7;
  });

  const filteredOrders = orders.filter(o =>
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
    <div className="w-full max-w-full space-y-4 pb-12">
      
      {/* Sleek Compact Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Active Accounts Warranty Register</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                {orders.length} Accounts Active
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Complete register of all active warranties, subscription start/end dates, and remaining days.
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
              placeholder="Search warranty register..."
              className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-purple-600 w-44 sm:w-56 font-medium"
            />
          </div>
        </div>
      </div>

      {/* MOBILE CARD LIST (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-xs text-slate-400 font-medium">
            No accounts match your search.
          </div>
        ) : (
          filteredOrders.map((o) => {
            const remainingDays = getRemainingWarrantyDays(o.endDate);
            const isExpiring = remainingDays > 0 && remainingDays <= 7;

            return (
              <div key={o.id} className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs transition-colors duration-200">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{o.customerName}</div>
                    <div className="text-[10px] text-purple-700 dark:text-purple-400 font-mono font-bold">{o.receiptId}</div>
                  </div>

                  {remainingDays === 0 ? (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Expired
                    </span>
                  ) : isExpiring ? (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                      {remainingDays} / {o.warrantyDays} Days
                    </span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {remainingDays} / {o.warrantyDays} Days
                    </span>
                  )}
                </div>

                {/* Product + Warranty Period */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Product</span>
                    <span className="block font-bold text-slate-900 dark:text-white truncate">{o.productName}</span>
                    <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">{o.plan}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Warranty Period</span>
                    <span className="block font-mono text-slate-600 dark:text-zinc-400 text-[11px]">{o.startDate}</span>
                    <span className="block font-mono text-slate-600 dark:text-zinc-400 text-[11px]">→ <span className="font-bold text-slate-900 dark:text-white">{o.endDate}</span></span>
                  </div>
                </div>

                {/* Account Login / Link Box */}
                <div className="bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 font-mono text-xs flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-sans font-bold shrink-0">Login / Link:</span>
                  <span className="text-slate-800 dark:text-zinc-200 font-bold truncate" title={o.accountEmail || o.activationUrl || ''}>
                    {o.accountEmail || o.activationUrl || 'N/A'}
                  </span>
                </div>

                {/* Reminded Toggle + Extend */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer select-none min-w-0">
                    <input
                      type="checkbox"
                      checked={!!o.isReminded}
                      onChange={() => toggleReminded(o.id)}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-slate-600 dark:text-zinc-400 font-semibold">
                      {o.isReminded ? 'Reminded' : 'Mark Reminded'}
                    </span>
                  </label>
                  <button
                    onClick={() => handleOpenExtend(o)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold rounded-xl transition shadow-xs shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>+ Extend</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Table: All Active Accounts Warranty & Reminders (md+) */}
      <div className="hidden md:block bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Active Accounts Register</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-bold">{filteredOrders.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">RECEIPT & CUSTOMER</th>
                <th className="py-3 px-3.5 whitespace-nowrap">PRODUCT PLAN</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ACCOUNT LOGIN / LINK</th>
                <th className="py-3 px-3.5 whitespace-nowrap">START & END DATE</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">REMAINING DAYS</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">REMINDED?</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 z-10 shadow-xs">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-sans font-medium">
                    No accounts match your search.
                  </td>
                </tr>
              ) : filteredOrders.map((o) => {
                const remainingDays = getRemainingWarrantyDays(o.endDate);
                const isExpiring = remainingDays > 0 && remainingDays <= 7;

                return (
                  <tr key={o.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition">
                    <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{o.customerName}</div>
                      <div className="text-[10px] text-purple-700 dark:text-purple-400 font-mono font-bold">{o.receiptId}</div>
                    </td>
                    <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-zinc-200">{o.productName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">{o.plan}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-800 dark:text-zinc-200 font-bold truncate max-w-[140px] sm:max-w-[220px] whitespace-nowrap" title={o.accountEmail || o.activationUrl || ''}>
                      {o.accountEmail || o.activationUrl || 'N/A'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      {o.startDate} → <span className="font-bold text-slate-900 dark:text-white">{o.endDate}</span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {remainingDays === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 whitespace-nowrap inline-block">
                          Expired
                        </span>
                      ) : isExpiring ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 whitespace-nowrap inline-block">
                          {remainingDays} / {o.warrantyDays} Days
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 whitespace-nowrap inline-block">
                          {remainingDays} / {o.warrantyDays} Days
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={!!o.isReminded}
                        onChange={() => toggleReminded(o.id)}
                        className="rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-[#09090b] border-l border-slate-100 dark:border-zinc-800/80 z-10 shadow-xs">
                      <button
                        onClick={() => handleOpenExtend(o)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold rounded-xl transition shadow-xs whitespace-nowrap inline-flex items-center space-x-1.5 ml-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>+ Extend Credentials</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extension / Renewal Modal */}
      {extendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs">
          <div className="my-auto bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Issue Monthly Renewal for {extendingOrder.customerName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Update month 2/3 login credentials. Old credentials will be archived automatically to history.
            </p>

            <form onSubmit={handleSaveExtend} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">New Account Email</label>
                <input
                  type="text"
                  value={extCreds.accountEmail}
                  onChange={(e) => setExtCreds({ ...extCreds, accountEmail: e.target.value })}
                  placeholder="new_month_email@gmail.com"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">New Account Password</label>
                <input
                  type="text"
                  value={extCreds.accountPassword}
                  onChange={(e) => setExtCreds({ ...extCreds, accountPassword: e.target.value })}
                  placeholder="NewPassword#2026"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Renewal Notes</label>
                <input
                  type="text"
                  value={extCreds.note}
                  onChange={(e) => setExtCreds({ ...extCreds, note: e.target.value })}
                  placeholder="Issued Month 2 replacement account"
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-extrabold"
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
