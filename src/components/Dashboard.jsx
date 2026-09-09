import React from 'react';
import { useErpStore } from '../store/useErpStore';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  CreditCard,
  Calendar,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

export default function Dashboard() {
  const { orders, products, customers, setActiveTab, getRemainingWarrantyDays } = useErpStore();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.sellingPrice || 0) - (o.discount || 0), 0);
  const totalCost = orders.reduce((sum, o) => sum + (o.costPrice || 0), 0);
  const totalProfit = orders.reduce((sum, o) => sum + (o.netProfit || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Chart Demo Data
  const chartData = [
    { day: 'Sep 1', revenue: 15000, profit: 8000 },
    { day: 'Sep 5', revenue: 28000, profit: 14000 },
    { day: 'Sep 10', revenue: 22000, profit: 11000 },
    { day: 'Sep 15', revenue: 45000, profit: 24000 },
    { day: 'Sep 20', revenue: 38000, profit: 19000 },
    { day: 'Sep 25', revenue: 62000, profit: 31000 },
    { day: 'Sep 30', revenue: 75000, profit: 42000 },
  ];

  // Top Products calculation
  const productStats = products.map(prod => {
    const matchedOrders = orders.filter(o => o.productName === prod.name);
    const revenue = matchedOrders.reduce((sum, o) => sum + (o.sellingPrice - o.discount), 0) || (prod.sellingPrice * 3);
    return { name: prod.name, plan: prod.plan, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const maxProdRevenue = Math.max(...productStats.map(p => p.revenue), 1);

  // Expiring Warranty Alerts
  const expiringOrders = orders.filter(o => {
    const days = getRemainingWarrantyDays(o.endDate);
    return days > 0 && days <= 7;
  });

  return (
    <div className="w-full max-w-full space-y-6 pb-12">
      
      {/* Dashboard Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Welcome back, Maung Lenn! Here is your business overview.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-4 py-2 bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2 shadow-xs">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Sep 1 – Sep 30, 2026</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards (Hercules ERP Style) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 relative overflow-hidden transition-colors duration-200 min-w-0">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400 min-w-0">
            <span className="truncate">Total Revenue</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center space-x-0.5 shrink-0">
              <ArrowUpRight className="w-3 h-3" />
              <span>12.5%</span>
            </span>
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono truncate" title={`${totalRevenue.toLocaleString()} MMK`}>
            {totalRevenue.toLocaleString()} <span className="text-xs font-sans text-slate-400">MMK</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="h-5 sm:h-6 w-full pt-1">
            <svg className="w-full h-full text-indigo-500 stroke-current fill-none" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 20 Q 25 15, 50 12 T 100 3" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 relative overflow-hidden transition-colors duration-200 min-w-0">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400 min-w-0">
            <span className="truncate">Total Orders</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center space-x-0.5 shrink-0">
              <ArrowUpRight className="w-3 h-3" />
              <span>8.3%</span>
            </span>
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono truncate">
            {orders.length} <span className="text-xs font-sans text-slate-400">Orders</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="h-5 sm:h-6 w-full pt-1">
            <svg className="w-full h-full text-violet-500 stroke-current fill-none" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 22 Q 25 18, 50 14 T 100 5" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 3: Gross Profit */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 relative overflow-hidden transition-colors duration-200 min-w-0">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400 min-w-0">
            <span className="truncate">Gross Profit</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center space-x-0.5 shrink-0">
              <ArrowUpRight className="w-3 h-3" />
              <span>15.7%</span>
            </span>
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-emerald-400 font-mono truncate" title={`+${totalProfit.toLocaleString()} MMK`}>
            +{totalProfit.toLocaleString()} <span className="text-xs font-sans text-slate-400">MMK</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="h-5 sm:h-6 w-full pt-1">
            <svg className="w-full h-full text-emerald-500 stroke-current fill-none" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 24 Q 25 19, 50 10 T 100 2" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Metric 4: Avg. Order Value */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 relative overflow-hidden transition-colors duration-200 min-w-0">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400 min-w-0">
            <span className="truncate">Avg. Order Value</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center space-x-0.5 shrink-0">
              <ArrowUpRight className="w-3 h-3" />
              <span>5.6%</span>
            </span>
          </div>
          <div className="text-lg xs:text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono truncate" title={`${avgOrderValue.toLocaleString()} MMK`}>
            {avgOrderValue.toLocaleString()} <span className="text-xs font-sans text-slate-400">MMK</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="h-5 sm:h-6 w-full pt-1">
            <svg className="w-full h-full text-purple-500 stroke-current fill-none" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path d="M0 20 Q 25 17, 50 12 T 100 6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* Middle Section: Sales Overview Chart (Left) + Top Products (Right) */}
      {/* Middle Section: Sales Overview Chart (Left) + Top Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Sales Overview Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors duration-200 min-w-0 max-w-full overflow-hidden">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Sales Overview</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revenue & Profit performance trajectory</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 focus:outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2 min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val.toLocaleString()} MMK`, '']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products List */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors duration-200 min-w-0 max-w-full overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Top Products</h2>
            <button onClick={() => setActiveTab('brain')} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              By Revenue
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {productStats.map((item, idx) => {
              const pct = Math.round((item.revenue / maxProdRevenue) * 100);
              return (
                <div key={idx} className="space-y-1.5 min-w-0">
                  <div className="flex justify-between text-xs items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px] xs:max-w-[170px] min-w-0">
                      {item.name} <span className="text-[10px] font-normal text-slate-400 hidden xs:inline">({item.plan})</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-200 shrink-0">
                      {item.revenue.toLocaleString()} MMK
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Orders (Left) + Activity Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors duration-200 min-w-0 max-w-full overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
            <button 
              onClick={() => setActiveTab('database')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition min-w-0">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold shrink-0">
                    {o.receiptId.slice(-3)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate max-w-[110px] xs:max-w-[160px]">{o.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[110px] xs:max-w-[160px]">{o.productName} ({o.plan})</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
                  <div className="text-right font-mono">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {((o.sellingPrice || 0) - (o.discount || 0)).toLocaleString()} MMK
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      +{o.netProfit.toLocaleString()} MMK
                    </div>
                  </div>

                  <span className="hidden xs:inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors duration-200 min-w-0 max-w-full overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Activity Feed</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Live Logs</span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  New cashier order <strong className="font-mono text-indigo-600 dark:text-indigo-400">#ORD-2026-0801</strong> created
                </p>
                <span className="text-[10px] text-slate-400">2 minutes ago</span>
              </div>
            </div>

            {expiringOrders.length > 0 && (
              <div className="flex items-start space-x-3 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    Warranty expiring for <strong className="text-amber-600 dark:text-amber-400 font-bold">{expiringOrders[0].customerName}</strong>
                  </p>
                  <span className="text-[10px] text-slate-400">15 minutes ago</span>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  VIP discount (-500 MMK) applied for regular customer
                </p>
                <span className="text-[10px] text-slate-400">1 hour ago</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  Product catalog updated with 1-Year CapCut Pro plan
                </p>
                <span className="text-[10px] text-slate-400">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
