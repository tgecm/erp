import React, { useState, useMemo } from 'react';
import { useErpStore } from '../store/useErpStore';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function MasterRecords() {
  const { orders, deleteOrder, setActiveReceipt, getRemainingWarrantyDays, visibleColumns, toggleColumnVisibility, applyPreset } = useErpStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expiryFilter, setExpiryFilter] = useState('ALL');
  const [showConfig, setShowConfig] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        o.id.toLowerCase().includes(query) ||
        o.receiptId.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        (o.accountEmail && o.accountEmail.toLowerCase().includes(query)) ||
        (o.householdCode && o.householdCode.toLowerCase().includes(query)) ||
        o.productName.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === 'ALL' || o.category === selectedCategory;

      const remainingDays = getRemainingWarrantyDays(o.endDate);
      let matchesExpiry = true;
      if (expiryFilter === 'EXPIRING') {
        matchesExpiry = remainingDays > 0 && remainingDays <= 7;
      } else if (expiryFilter === 'EXPIRED') {
        matchesExpiry = remainingDays === 0;
      } else if (expiryFilter === 'ACTIVE') {
        matchesExpiry = remainingDays > 7;
      }

      return matchesSearch && matchesCategory && matchesExpiry;
    });
  }, [orders, searchTerm, selectedCategory, expiryFilter, getRemainingWarrantyDays]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleExportCSV = () => {
    const headers = [
      'Order ID', 'Receipt ID', 'Customer Name', 'Platform', 'Category', 'Product', 'Plan',
      'Account Email', 'Account Password', 'Household Code', 'Start Date', 'End Date',
      'Warranty Days', 'Cost Price', 'Selling Price', 'Discount', 'Net Profit', 'Status'
    ];

    const csvRows = [headers.join(',')];

    filteredOrders.forEach((o) => {
      const row = [
        o.id, o.receiptId, `"${o.customerName}"`, `"${o.platform || 'Direct'}"`, `"${o.category}"`, `"${o.productName}"`,
        `"${o.plan}"`, `"${o.accountEmail || ''}"`, `"${o.accountPassword || ''}"`, `"${o.householdCode || ''}"`,
        o.startDate, o.endDate, o.warrantyDays, o.costPrice, o.sellingPrice, o.discount, o.netProfit, o.status
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DigitalCity_MasterRecords_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const categories = ['ALL', 'Streaming', 'Design & Video', 'Productivity', 'Music'];

  const columnsList = [
    { key: 'recordNo', label: 'Record No' },
    { key: 'createdDate', label: 'Created Date' },
    { key: 'updatedDate', label: 'Updated Date' },
    { key: 'orderDate', label: 'Order Date' },
    { key: 'orderId', label: 'Order Id' },
    { key: 'receiptId', label: 'Receipt Id' },
    { key: 'trackingId', label: 'Tracking Id' },
    { key: 'salesChannel', label: 'Sales Channel' },
    { key: 'platform', label: 'Platform' },
    { key: 'cashier', label: 'Cashier' },
    { key: 'orderStatus', label: 'Order Status' },
    { key: 'customerId', label: 'Customer Id' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'customerType', label: 'Customer Type' },
    { key: 'customerStatus', label: 'Customer Status' },
    { key: 'purchaseCount', label: 'Purchase Count' },
    { key: 'category', label: 'Category' },
    { key: 'productName', label: 'Product Name' },
    { key: 'productCode', label: 'Product Code' },
    { key: 'productVersion', label: 'Product Version' },
    { key: 'planName', label: 'Plan Name' },
    { key: 'householdCode', label: 'Household Code' },
    { key: 'costPrice', label: 'Cost Price' },
    { key: 'sellingPrice', label: 'Selling Price' },
    { key: 'discount', label: 'Discount' },
    { key: 'netProfit', label: 'Net Profit' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'remainingDays', label: 'Remaining Days' },
  ];

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 pb-12">
      
      {/* Top Banner (Compact & Optimized) */}
      <div className="flex flex-row items-center justify-between gap-2 bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-3 sm:p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider shrink-0">
              📊 Master Record
            </span>
            <h1 className="text-sm sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              Sales Master Records
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 border border-slate-200 dark:border-zinc-700"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Config</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Excel</span>
          </button>
        </div>
      </div>

      {/* Column Visibility Control Panel (Matches Screenshot Exact Layout) */}
      {showConfig && (
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-5 rounded-3xl space-y-4 shadow-xs transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
            <div className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              VIEW PRESETS:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Standard', 'Compact', 'Detailed', 'Financial', 'Warranty'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-zinc-700"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              COLUMN VISIBILITY
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs font-medium">
              {columnsList.map((col) => (
                <label key={col.key} className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!visibleColumns[col.key]}
                    onChange={() => toggleColumnVisibility(col.key)}
                    className="rounded text-orange-600 focus:ring-orange-500 accent-orange-600"
                  />
                  <span className="text-[11px] font-semibold truncate">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-3.5 sm:p-4 rounded-3xl flex flex-col md:flex-row gap-3 justify-between shadow-xs transition-colors duration-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search Order ID, Receipt ID, Customer, Email, Platform..."
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition"
          />
        </div>

        <div className="grid grid-cols-2 md:flex gap-2 items-center">
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-2xl">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-bold w-full"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-2.5 py-1.5 rounded-2xl">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <select
              value={expiryFilter}
              onChange={(e) => { setExpiryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer font-bold w-full"
            >
              <option value="ALL" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">All Expiry</option>
              <option value="ACTIVE" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Active (&gt; 7D)</option>
              <option value="EXPIRING" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Expiring (&lt; 7D)</option>
              <option value="EXPIRED" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Expired (0D)</option>
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="block md:hidden space-y-3">
        {paginatedOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs font-medium">
            No sales records match your criteria.
          </div>
        ) : (
          paginatedOrders.map((o) => {
            const remainingDays = getRemainingWarrantyDays(o.endDate);
            const isExpiringSoon = remainingDays > 0 && remainingDays <= 7;
            const isExpired = remainingDays === 0;

            return (
              <div key={o.id} className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs transition-colors duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono text-sm">{o.receiptId}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{o.id}</span>
                  </div>

                  {isExpired ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                      Expired
                    </span>
                  ) : isExpiringSoon ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                      {remainingDays} Days Left
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      {remainingDays} Days Left
                    </span>
                  )}
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer</span>
                    <span className="font-bold text-slate-900 dark:text-white">{o.customerName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{o.contactInfo}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Product</span>
                    <span className="font-bold text-slate-900 dark:text-white">{o.productName}</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">{o.plan}</span>
                  </div>
                </div>

                {/* Account Credentials Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                    <span className="text-[10px] text-slate-400 font-sans font-bold">Email:</span>
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 truncate max-w-[170px]">{o.accountEmail}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                    <span className="text-[10px] text-slate-400 font-sans font-bold">Pass:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{o.accountPassword}</span>
                  </div>
                  {o.householdCode && (
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-sans font-bold">Code:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 rounded">{o.householdCode}</span>
                    </div>
                  )}
                </div>

                {/* Financial Footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Paid / Net Profit</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {((o.sellingPrice || 0) - (o.discount || 0)).toLocaleString()} MMK
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-[11px] block">
                      +{(o.netProfit || 0).toLocaleString()} MMK
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveReceipt(o)}
                      className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Slip</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete order ${o.id}?`)) deleteOrder(o.id);
                      }}
                      className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE CONTAINER */}
      <div className="hidden md:block bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-4">Receipt & Order</th>
                <th className="py-4 px-4">Customer Info</th>
                <th className="py-4 px-4">Product Plan</th>
                <th className="py-4 px-4">Account Login Credentials</th>
                <th className="py-4 px-4">Household Code</th>
                <th className="py-4 px-4 text-center">Warranty Days</th>
                <th className="py-4 px-4 text-right">Selling / Cost / Net</th>
                <th className="py-4 px-4 text-center sticky right-0 bg-slate-50 dark:bg-slate-800/90 border-l border-slate-200 dark:border-slate-800 z-10">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400 font-sans font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => {
                  const remainingDays = getRemainingWarrantyDays(o.endDate);
                  const isExpiringSoon = remainingDays > 0 && remainingDays <= 7;
                  const isExpired = remainingDays === 0;

                  return (
                    <tr key={o.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{o.receiptId}</div>
                        <div className="text-[10px] text-slate-400">{o.id}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">{o.startDate}</div>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white">{o.customerName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{o.contactInfo}</div>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white">{o.productName}</div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{o.plan}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                          {o.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 dark:text-white font-bold truncate max-w-[160px]" title={o.accountEmail}>
                          {o.accountEmail}
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] truncate max-w-[160px]" title={o.accountPassword}>
                          {o.accountPassword}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {o.householdCode ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                            {o.householdCode}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-slate-900 dark:text-white">{o.warrantyDays} Days</div>
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Expired
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                            {remainingDays} Days Left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {remainingDays} Days Left
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {((o.sellingPrice || 0) - (o.discount || 0)).toLocaleString()} MMK
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cost: {(o.costPrice || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          Profit: +{(o.netProfit || 0).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center sticky right-0 bg-white dark:bg-[#09090b] border-l border-slate-100 dark:border-slate-800/60 z-10">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setActiveReceipt(o)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl transition"
                            title="View / Print Receipt Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete order ${o.id}?`)) {
                                deleteOrder(o.id);
                              }
                            }}
                            className="p-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 rounded-xl transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 bg-slate-50/80 dark:bg-zinc-900/80 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredOrders.length)}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{filteredOrders.length}</span> records
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-xl font-bold cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-slate-900 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
