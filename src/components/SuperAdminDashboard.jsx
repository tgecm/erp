import React, { useState, useEffect } from 'react';
import { useErpStore } from '../store/useErpStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Package, ShoppingCart, Activity, Shield, Settings, Server, 
  Database, HardDrive, Cpu, DollarSign, TrendingUp, LogOut, Moon, Sun,
  Trash2, ChevronDown, CheckCircle2, UserCheck, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';

const API_BASE = window.location.port === '3000' ? 'http://localhost:4000/api' : '/api';

export default function SuperAdminDashboard() {
  const { 
    token, user, logout, theme, toggleTheme,
    products, orders, customers, households, suppliers 
  } = useErpStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [sysUsers, setSysUsers] = useState([]);
  const [healthInfo, setHealthInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Overview Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.sellingPrice || 0) - (o.discount || 0), 0);
  const totalProfit = orders.reduce((sum, o) => sum + (o.netProfit || 0), 0);

  // Demo chart data
  const chartData = [
    { day: 'Mon', revenue: 12000, users: 4 },
    { day: 'Tue', revenue: 19000, users: 7 },
    { day: 'Wed', revenue: 15000, users: 5 },
    { day: 'Thu', revenue: 28000, users: 12 },
    { day: 'Fri', revenue: 22000, users: 8 },
    { day: 'Sat', revenue: 45000, users: 20 },
    { day: 'Sun', revenue: 38000, users: 15 },
  ];

  // Fetch functions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSysUsers(data.users || data); // Adjust based on actual response structure
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHealthInfo(data);
      }
    } catch (err) {
      console.error('Error fetching health:', err);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'system') fetchHealth();
  }, [activeTab]);

  // Tab configurations
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'data', label: 'Data Overview', icon: Database },
    { id: 'system', label: 'System Health', icon: Server },
  ];

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-[#040405] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-200">
      
      {/* Top Navigation */}
      <div className="shrink-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/90 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">SuperAdmin Control</h1>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">Master Access Panel</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="hidden sm:flex items-center px-4 py-2 bg-slate-100 dark:bg-zinc-800/60 rounded-xl space-x-2 border border-transparent dark:border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs font-bold">{user?.name || 'Superadmin'}</span>
          </div>

          <button 
            onClick={logout}
            className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition border border-red-100 dark:border-red-900/30"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'bg-white dark:bg-[#09090b] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-100' : ''}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {/* ================= OVERVIEW TAB ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: 'Total Users', value: sysUsers.length || 'N/A', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/50' },
                    { label: 'Total Products', value: products.length, icon: Package, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/50' },
                    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
                    { label: 'Customers', value: customers.length, icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
                    { label: 'Revenue', value: `${(totalRevenue/1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50' },
                    { label: 'Profit', value: `${(totalProfit/1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">System Performance</h2>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                          <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                          <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorSys)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Global Orders</h2>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map(o => (
                        <div key={o.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40">
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{o.customerName}</div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{o.productName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{o.sellingPrice.toLocaleString()}</div>
                            <div className="text-[10px] font-bold text-emerald-500">+{o.netProfit.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= USER MANAGEMENT TAB ================= */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-200/80 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Management</h2>
                    <p className="text-xs text-slate-500">Manage access and roles for all users in the system.</p>
                  </div>
                  <button onClick={fetchUsers} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                    Refresh
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-900/50 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {sysUsers.length > 0 ? sysUsers.map(u => (
                        <tr key={u.id || u._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase
                              ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 
                                u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 
                                'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300'}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.isVerified ? (
                              <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center text-xs font-bold text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <select 
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id || u._id, e.target.value)}
                              disabled={u.role === 'superadmin'}
                              className="text-xs bg-slate-100 dark:bg-zinc-800 border-none rounded-xl font-bold text-slate-700 dark:text-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value="superadmin">SuperAdmin</option>
                              <option value="admin">Admin</option>
                              <option value="staff">Staff</option>
                            </select>
                            <button 
                              onClick={() => handleDeleteUser(u.id || u._id)}
                              disabled={u.role === 'superadmin'}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-semibold">
                            {loading ? 'Loading users...' : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= DATA OVERVIEW TAB ================= */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Products', count: products.length, icon: Package },
                    { label: 'Orders', count: orders.length, icon: ShoppingCart },
                    { label: 'Customers', count: customers.length, icon: UserCheck },
                    { label: 'Households', count: households.length, icon: Users },
                    { label: 'Suppliers', count: suppliers.length, icon: Database },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{item.count}</div>
                        <div className="text-xs font-bold text-slate-500">{item.label}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-center text-slate-400">
                        <item.icon className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Products */}
                  <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-indigo-500" /> Products
                    </h3>
                    <div className="space-y-3">
                      {products.slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-zinc-800/30 p-3 rounded-xl">
                          <span className="font-bold">{p.name}</span>
                          <span className="font-semibold text-slate-500">{p.plan}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Customers */}
                  <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-emerald-500" /> Recent Customers
                    </h3>
                    <div className="space-y-3">
                      {customers.slice(0, 5).map(c => (
                        <div key={c.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-zinc-800/30 p-3 rounded-xl">
                          <span className="font-bold">{c.name}</span>
                          <span className="font-semibold text-slate-500 text-xs">{c.phone || c.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= SYSTEM HEALTH TAB ================= */}
            {activeTab === 'system' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Server Status */}
                <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-extrabold flex items-center">
                      <Server className="w-5 h-5 mr-2 text-indigo-500" /> Server Info
                    </h3>
                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg uppercase flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                      Online
                    </span>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-slate-500 font-semibold">Status</span>
                      <span className="font-bold text-emerald-500">{healthInfo?.status || 'OK'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-slate-500 font-semibold">Uptime</span>
                      <span className="font-bold">{healthInfo?.uptime ? `${Math.floor(healthInfo.uptime / 3600)}h ${(Math.floor(healthInfo.uptime / 60) % 60)}m` : '...'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-slate-500 font-semibold">Environment</span>
                      <span className="font-bold">{healthInfo?.env || 'production'}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-500 font-semibold">Version</span>
                      <span className="font-bold">{healthInfo?.version || '1.0.0'}</span>
                    </div>
                  </div>
                  <button onClick={fetchHealth} className="mt-4 w-full py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition">
                    Refresh Status
                  </button>
                </div>

                {/* Database Status */}
                <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-extrabold flex items-center">
                      <Database className="w-5 h-5 mr-2 text-purple-500" /> Database
                    </h3>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-slate-500 font-semibold">Connection</span>
                      <span className="font-bold text-emerald-500">Connected</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-slate-500 font-semibold">Type</span>
                      <span className="font-bold">{healthInfo?.dbType || 'PostgreSQL'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <span className="text-slate-500 font-semibold">Database</span>
                      <span className="font-bold">{healthInfo?.database || 'erp_crossmart'}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
