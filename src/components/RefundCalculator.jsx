import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { Calculator, RefreshCw, DollarSign, ArrowRightLeft, Search } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-4 pb-12">
      
      {/* Sleek Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Prorated Refund Calculator</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Prorated Settlement
              </span>
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order to calculate..."
            className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 w-44 sm:w-60"
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Interactive Calculator Box */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs border-b border-slate-100 dark:border-zinc-800 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Calculate Refund Amount</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Select Order</label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setCustomDaysLeft('');
                  setCustomTotalDays('');
                  setCustomPricePaid('');
                }}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-bold"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                    {o.customerName} - {o.productName} ({o.receiptId})
                  </option>
                ))}
              </select>
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
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
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
                    <th className="py-3 px-3.5 whitespace-nowrap">RECEIPT & CUSTOMER</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">PRODUCT PLAN</th>
                    <th className="py-3 px-3.5 font-mono text-right whitespace-nowrap">NET PAID (MMK)</th>
                    <th className="py-3 px-3.5 text-center whitespace-nowrap">REMAINING DAYS</th>
                    <th className="py-3 px-3.5 font-mono text-right whitespace-nowrap">ESTIMATED REFUND</th>
                    <th className="py-3 px-3.5 text-right whitespace-nowrap">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredOrders.map((o) => {
                    const remDays = getRemainingWarrantyDays(o.endDate);
                    const netPaid = (o.sellingPrice || 0) - (o.discount || 0);
                    const estRefund = o.warrantyDays > 0 ? Math.round((remDays / o.warrantyDays) * netPaid) : 0;

                    return (
                      <tr key={o.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition">
                        <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white">{o.customerName}</div>
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">{o.receiptId}</div>
                        </td>
                        <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-zinc-200">{o.productName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">{o.plan}</div>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-extrabold text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                          {netPaid.toLocaleString()} MMK
                        </td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
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
                        <td className="py-3 px-3.5 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {estRefund.toLocaleString()} MMK
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
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
