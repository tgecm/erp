import React, { useState, useEffect, useRef } from 'react';
import { useErpStore } from '../store/useErpStore';
import { Calculator, RefreshCw, DollarSign, ArrowRightLeft, Search, ChevronDown } from 'lucide-react';

function OrderSelectDropdown({ orders, selectedOrderId, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedOrd = orders.find(o => o.id === selectedOrderId) || orders[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    return (o.customerName && o.customerName.toLowerCase().includes(q)) ||
           (o.productName && o.productName.toLowerCase().includes(q)) ||
           (o.receiptId && o.receiptId.toLowerCase().includes(q)) ||
           (o.id && o.id.toLowerCase().includes(q));
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-left transition flex items-center justify-between shadow-xs hover:border-emerald-500/50 focus:outline-none"
      >
        <div className="min-w-0 flex-1 pr-2">
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {selectedOrd ? `${selectedOrd.customerName} - ${selectedOrd.productName}` : 'Select Order...'}
          </div>
          {selectedOrd && (
            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              {selectedOrd.receiptId}
            </div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-72 flex flex-col">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID, receipt, or customer..."
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Order Items List */}
          <div className="overflow-y-auto p-1 space-y-0.5 divide-y divide-slate-100/40 dark:divide-zinc-800/30">
            {filteredOrders.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching orders found.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = ord.id === selectedOrderId;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      onSelect(ord.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-800/50'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-800 dark:text-slate-200 font-medium'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs truncate font-bold">
                        {ord.customerName} - {ord.productName}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {ord.receiptId} • {ord.plan}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RefundCalculator() {
  const { orders, getRemainingWarrantyDays, calculateRefundEstimate } = useErpStore();

  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const [customDaysLeft, setCustomDaysLeft] = useState('');
  const [customTotalDays, setCustomTotalDays] = useState('');
  const [customPricePaid, setCustomPricePaid] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const autoRemainingDays = selectedOrder ? getRemainingWarrantyDays(selectedOrder.endDate) : 0;
  const calcDays = Number(customDaysLeft) || autoRemainingDays;
  const calcTotal = Number(customTotalDays) || (selectedOrder?.warrantyDays || 30);
  const calcPrice = Number(customPricePaid) || ((selectedOrder?.sellingPrice || 0) - (selectedOrder?.discount || 0));

  const customRefundEstimate = calcTotal > 0 ? Math.round((calcDays / calcTotal) * calcPrice) : 0;

  const filteredOrders = orders.filter(o =>
    !searchQuery ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.receiptId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-full space-y-4 pb-12">
      
      {/* Sleek Header Toolbar (Optimized) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                Prorated Refund Calculator
              </h1>
              <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                Prorated
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order..."
            className="w-full sm:w-56 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive Calculator Box */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs border-b border-slate-100 dark:border-zinc-800 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Calculate Refund Amount</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Select Order</label>
              <OrderSelectDropdown
                orders={orders}
                selectedOrderId={selectedOrderId}
                onSelect={(id) => {
                  setSelectedOrderId(id);
                  setCustomDaysLeft('');
                  setCustomTotalDays('');
                  setCustomPricePaid('');
                }}
              />
            </div>

            {selectedOrder && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Product Plan:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedOrder.productName} ({selectedOrder.plan})</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Net Price Paid:</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                    {((selectedOrder.sellingPrice || 0) - (selectedOrder.discount || 0)).toLocaleString()} MMK
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Remaining Days:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-mono font-extrabold">
                    {autoRemainingDays} / {selectedOrder.warrantyDays} Days
                  </span>
                </div>
              </div>
            )}

            {/* Variable Adjustments */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Adjust Calculation Variables
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Remaining Days</label>
                  <input
                    type="number"
                    value={customDaysLeft}
                    onChange={(e) => setCustomDaysLeft(e.target.value)}
                    placeholder={autoRemainingDays}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Total Days</label>
                  <input
                    type="number"
                    value={customTotalDays}
                    onChange={(e) => setCustomTotalDays(e.target.value)}
                    placeholder={selectedOrder?.warrantyDays || 30}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Net Paid Amount (MMK)</label>
                <input
                  type="number"
                  value={customPricePaid}
                  onChange={(e) => setCustomPricePaid(e.target.value)}
                  placeholder={calcPrice}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Estimated Refund Result Card */}
            <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-xl p-4 text-center space-y-1 shadow-xs">
              <span className="text-[11px] text-emerald-100 font-bold block">Estimated Refund Amount (လက်ကျန်ရက် တွက်ချက်ငွေ)</span>
              <div className="text-2xl font-extrabold font-mono">
                {customRefundEstimate.toLocaleString()} MMK
              </div>
              <p className="text-[9px] text-emerald-200">
                Formula: ({calcDays} Days Remaining / {calcTotal} Total Days) × {calcPrice.toLocaleString()} MMK
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: All Accounts Prorated Refund Overview Table */}
        <div className="xl:col-span-8 space-y-3">
          {/* MOBILE CARD LIST (md:hidden) */}
          <div className="md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-xs text-slate-400 font-medium">
                No orders match your search.
              </div>
            ) : (
              filteredOrders.map((o) => {
                const remDays = getRemainingWarrantyDays(o.endDate);
                const netPaid = (o.sellingPrice || 0) - (o.discount || 0);
                const estRefund = o.warrantyDays > 0 ? Math.round((remDays / o.warrantyDays) * netPaid) : 0;

                return (
                  <div key={o.id} className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs transition-colors duration-200">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{o.customerName}</div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">{o.receiptId}</div>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-extrabold inline-block ${
                        remDays === 0
                          ? 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          : remDays <= 7
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {remDays} / {o.warrantyDays} Days
                      </span>
                    </div>

                    {/* Product + Paid */}
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Product</span>
                        <span className="block font-bold text-slate-900 dark:text-white truncate">{o.productName}</span>
                        <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">{o.plan}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Net Paid</span>
                        <span className="block font-mono font-extrabold text-slate-700 dark:text-zinc-300">{netPaid.toLocaleString()} MMK</span>
                      </div>
                    </div>

                    {/* Estimated Refund + Calculate */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 gap-2">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Est. Refund</span>
                        <span className="block font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{estRefund.toLocaleString()} MMK</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOrderId(o.id);
                          setCustomDaysLeft('');
                          setCustomTotalDays('');
                          setCustomPricePaid('');
                          const main = document.querySelector('main');
                          if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition shadow-xs flex items-center space-x-1.5"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Calculate</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="hidden md:block bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>All Orders Prorated Refund Matrix</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-bold">{filteredOrders.length} Orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-3 whitespace-nowrap">RECEIPT & CUSTOMER</th>
                    <th className="py-3 px-3 whitespace-nowrap">PRODUCT PLAN</th>
                    <th className="py-3 px-2.5 font-mono text-right whitespace-nowrap">NET PAID (MMK)</th>
                    <th className="py-3 px-2.5 text-center whitespace-nowrap">REMAINING DAYS</th>
                    <th className="py-3 px-2.5 font-mono text-right whitespace-nowrap">ESTIMATED REFUND</th>
                    <th className="py-3 px-3 text-right whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 z-10 shadow-xs">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400 font-sans font-medium">
                        No orders match your search.
                      </td>
                    </tr>
                  ) : filteredOrders.map((o) => {
                    const remDays = getRemainingWarrantyDays(o.endDate);
                    const netPaid = (o.sellingPrice || 0) - (o.discount || 0);
                    const estRefund = o.warrantyDays > 0 ? Math.round((remDays / o.warrantyDays) * netPaid) : 0;

                    return (
                      <tr key={o.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition">
                        <td className="py-3 px-3 font-sans whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white">{o.customerName}</div>
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">{o.receiptId}</div>
                        </td>
                        <td className="py-3 px-3 font-sans whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-zinc-200">{o.productName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">{o.plan}</div>
                        </td>
                        <td className="py-3 px-2.5 text-right font-mono font-extrabold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                          {netPaid.toLocaleString()} MMK
                        </td>
                        <td className="py-3 px-2.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            remDays === 0 
                              ? 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400' 
                              : remDays <= 7 
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' 
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}>
                            {remDays} / {o.warrantyDays} Days
                          </span>
                        </td>
                        <td className="py-3 px-2.5 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {estRefund.toLocaleString()} MMK
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap sticky right-0 bg-white dark:bg-[#09090b] border-l border-slate-100 dark:border-zinc-800/80 z-10 shadow-xs">
                          <button
                            onClick={() => {
                              setSelectedOrderId(o.id);
                              setCustomDaysLeft('');
                              setCustomTotalDays('');
                              setCustomPricePaid('');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg transition"
                          >
                            Calculate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
