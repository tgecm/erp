import React from 'react';
import { useErpStore } from '../store/useErpStore';
import { 
  TrendingUp, 
  DollarSign, 
  Tag, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ShieldCheck,
  ShoppingBag,
  Users,
  Clock,
  CheckCircle,
  Package
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function FinanceDashboard() {
  const { orders, getRemainingWarrantyDays, theme } = useErpStore();

  const totalSelling = orders.reduce((sum, o) => sum + (o.sellingPrice || 0), 0);
  const totalCost = orders.reduce((sum, o) => sum + (o.costPrice || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalNetPaid = totalSelling - totalDiscount;
  const totalNetProfit = orders.reduce((sum, o) => sum + (o.netProfit || 0), 0);

  const profitMarginPercent = totalNetPaid > 0 ? Math.round((totalNetProfit / totalNetPaid) * 100) : 0;

  const expiringCount = orders.filter((o) => {
    const rem = getRemainingWarrantyDays(o.endDate);
    return rem > 0 && rem <= 7;
  }).length;

  // Group by Category for Charts
  const categoryStats = orders.reduce((acc, o) => {
    const cat = o.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = { category: cat, revenue: 0, cost: 0, profit: 0, count: 0 };
    }
    acc[cat].revenue += (o.sellingPrice || 0) - (o.discount || 0);
    acc[cat].cost += o.costPrice || 0;
    acc[cat].profit += o.netProfit || 0;
    acc[cat].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(categoryStats);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Real-time performance metrics & cashier financial intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-xs p-1 rounded-xl text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold shadow-xs">
            30d
          </span>
          <span className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            90d
          </span>
          <span className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            365d
          </span>
        </div>
      </div>

      {/* 4 Vivid Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Revenue */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 font-bold text-xl flex-shrink-0">
            $
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              TOTAL REVENUE
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalNetPaid.toLocaleString()} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">MMK</span>
            </div>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              TOTAL ORDERS
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {orders.length} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Sales</span>
            </div>
          </div>
        </div>

        {/* 3. Net Profit */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              NET PROFIT (+{profitMarginPercent}%)
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalNetProfit.toLocaleString()} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">MMK</span>
            </div>
          </div>
        </div>

        {/* 4. Expiring Warranties */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              EXPIRING (&lt; 7 DAYS)
            </div>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {expiringCount} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">Accounts</span>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Sales Value</span>
          <div className="text-lg font-bold text-slate-800 dark:text-white font-mono">{totalSelling.toLocaleString()} MMK</div>
        </div>

        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Cost of Goods (အရင်း)</span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">{totalCost.toLocaleString()} MMK</div>
        </div>

        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Discounts Issued</span>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono">{totalDiscount.toLocaleString()} MMK</div>
        </div>
      </div>

      {/* Main Charts & Top Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Profit Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Sales & Profit by Category</span>
            </h2>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-full">
              Category Metrics
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="category" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (MMK)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#f59e0b" name="Cost (MMK)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="Net Profit (MMK)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Product / Category Performance List */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>🏆 Top Product Categories</span>
          </h2>

          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.category} className="p-3 bg-slate-50 dark:bg-[#1a2336] border border-slate-200/60 dark:border-slate-800/80 rounded-xl space-y-1.5 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                  <span>{item.category} ({item.count} Orders)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-extrabold">+{item.profit.toLocaleString()} MMK</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 dark:bg-purple-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(15, (item.revenue / (totalNetPaid || 1)) * 100))}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Revenue: {item.revenue.toLocaleString()} MMK</span>
                  <span>Cost: {item.cost.toLocaleString()} MMK</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
