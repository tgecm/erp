import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { 
  Database, Plus, Search, Layers, Home, CreditCard, 
  Truck, Tag, Bell, Sliders, Edit, Trash2, CheckCircle2
} from 'lucide-react';

/* Compact definition row used by mobile cards */
const Field = ({ label, value, mono, accent }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 text-xs border-b border-slate-100/70 dark:border-zinc-800/50 last:border-0 min-w-0">
    <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">{label}</span>
    <span className={`text-right font-semibold min-w-0 truncate ${mono ? 'font-mono ' : ''}${accent ? accent : 'text-slate-700 dark:text-zinc-200'}`}>
      {value || '-'}
    </span>
  </div>
);

/* Small icon action button (edit / delete) reused in mobile cards */
const CardIconBtn = ({ onClick, danger, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-xl transition shrink-0 ${
      danger
        ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800'
        : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-zinc-800'
    }`}
  >
    {children}
  </button>
);

export default function ProductCatalog() {
  const { 
    products, addProduct, updateProduct, deleteProduct,
    households, addHousehold, updateHousehold, deleteHousehold,
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    customers,
  } = useErpStore();

  const [activeSubTab, setActiveSubTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Form states for Add New modal
  const [productForm, setProductForm] = useState({
    name: '', category: 'Streaming', plan: '1 Month', durationDays: 30, costPrice: 5000, sellingPrice: 9000, householdCode: '', deliveryMethod: 'Email & Password'
  });
  const [householdForm, setHouseholdForm] = useState({ name: '', code: '', adminNote: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', code: '', adminNote: '' });

  // Custom Categories list
  const categoriesList = [
    { code: 'CAT-01', name: 'Streaming', count: products.filter(p => p.category === 'Streaming').length, note: 'Netflix, YouTube, Disney+' },
    { code: 'CAT-02', name: 'Design & Video', count: products.filter(p => p.category === 'Design & Video').length, note: 'CapCut, Adobe, Canva' },
    { code: 'CAT-03', name: 'Productivity', count: products.filter(p => p.category === 'Productivity').length, note: 'MS365, Notion, ChatGPT' },
    { code: 'CAT-04', name: 'Music', count: products.filter(p => p.category === 'Music').length, note: 'Spotify, Apple Music' },
    { code: 'CAT-05', name: 'AI Tools', count: products.filter(p => p.category === 'AI Tools').length, note: 'ChatGPT, Midjourney, Claude' },
  ];

  // Custom Plans list
  const plansList = [
    { code: 'PLN-01', name: '1 Month Standard', duration: 30, autoRenew: true, note: 'Default 30-day plan' },
    { code: 'PLN-02', name: '1 Screen (1 Month)', duration: 30, autoRenew: true, note: 'Single screen slot' },
    { code: 'PLN-03', name: '1 Household Code', duration: 30, autoRenew: true, note: 'Full account household' },
    { code: 'PLN-04', name: '1 Year Access', duration: 365, autoRenew: false, note: 'Annual license key' },
    { code: 'PLN-05', name: 'Family Member (1 Month)', duration: 30, autoRenew: true, note: 'Shared family group' },
  ];

  // Custom Discounts list
  const discountsList = [
    { code: 'DISC-REGULAR', name: 'Regular Customer Discount', amount: '500 MMK', type: 'Fixed', note: 'Applied for repeat buyers' },
    { code: 'DISC-VIP', name: 'VIP Customer Discount', amount: '1,000 MMK', type: 'Fixed', note: 'Applied for high-volume customers' },
    { code: 'DISC-BULK', name: 'Bulk Order Promo', amount: '10%', type: 'Percentage', note: '3+ accounts single checkout' },
  ];

  // Custom Reminders list
  const remindersList = [
    { code: 'REM-07D', name: '7-Day Expiry Notification', trigger: '7 Days Before EndDate', status: 'Active', note: 'Highlight yellow in Warranty Manager' },
    { code: 'REM-01D', name: '1-Day Urgent Renewal Alert', trigger: '1 Day Before EndDate', status: 'Active', note: 'Highlight red in Warranty Manager' },
    { code: 'REM-AUTORENEW', name: 'Auto Subscription Extension', trigger: 'On Expiration Date', status: 'Manual Approval', note: 'Prompt cashier for 1-click renewal' },
  ];

  // Custom Automations list
  const automationsList = [
    { code: 'AUTO-RECEIPT', name: 'Auto Receipt PDF Generator', trigger: 'New Order Completed', action: 'Generate Thermal Receipt Slip', status: 'Enabled' },
    { code: 'AUTO-CRED', name: 'Credential History Archiver', trigger: 'Subscription Extension', action: 'Archive Old Email/Password', status: 'Enabled' },
    { code: 'AUTO-CUSTOMER', name: 'Customer VIP Status Recalculator', trigger: 'Total Spent > 50,000 MMK', action: 'Mark Customer as VIP', status: 'Enabled' },
  ];

  // Open Edit Handlers
  const handleOpenEdit = (item, type) => {
    setEditingItem({ ...item, itemType: type });
    setEditForm({
      name: item.name || '',
      category: item.category || 'Streaming',
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      householdCode: item.householdCode || '',
      deliveryMethod: item.deliveryMethod || 'Email & Password',
      code: item.code || '',
      adminNote: item.adminNote || item.note || '',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.itemType === 'product') {
      updateProduct(editingItem.id, {
        name: editForm.name,
        category: editForm.category,
        costPrice: Number(editForm.costPrice),
        sellingPrice: Number(editForm.sellingPrice),
        householdCode: editForm.householdCode,
        deliveryMethod: editForm.deliveryMethod,
      });
    } else if (editingItem.itemType === 'household') {
      updateHousehold(editingItem.id, {
        name: editForm.name,
        code: editForm.code,
        adminNote: editForm.adminNote,
      });
    } else if (editingItem.itemType === 'supplier') {
      updateSupplier(editingItem.id, {
        name: editForm.name,
        code: editForm.code,
        adminNote: editForm.adminNote,
      });
    }

    setEditingItem(null);
  };

  // Submit Handlers for Add
  const handleAddProduct = (e) => {
    e.preventDefault();
    addProduct({
      ...productForm,
      costPrice: Number(productForm.costPrice),
      sellingPrice: Number(productForm.sellingPrice),
      durationDays: Number(productForm.durationDays),
    });
    setShowAddModal(false);
  };

  const handleAddHousehold = (e) => {
    e.preventDefault();
    addHousehold(householdForm);
    setHouseholdForm({ name: '', code: '', adminNote: '' });
    setShowAddModal(false);
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    addSupplier(supplierForm);
    setSupplierForm({ name: '', code: '', adminNote: '' });
    setShowAddModal(false);
  };

  const subTabs = [
    { id: 'products', label: 'Products', icon: Database, count: products.length },
    { id: 'categories', label: 'Categories', icon: Layers, count: categoriesList.length },
    { id: 'households', label: 'Households', icon: Home, count: households.length },
    { id: 'plans', label: 'Plans', icon: CreditCard, count: plansList.length },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, count: suppliers.length },
    { id: 'discounts', label: 'Discounts', icon: Tag, count: discountsList.length },
    { id: 'reminders', label: 'Reminders', icon: Bell, count: remindersList.length },
    { id: 'automations', label: 'Automations', icon: Sliders, count: automationsList.length },
  ];

  return (
    <div className="space-y-6 max-w-full">
      
      {/* Top Banner Toolbar (Compact & Optimized) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 p-3 sm:p-4 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-xl shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              Brain Database ({subTabs.find(t => t.id === activeSubTab)?.label})
            </h1>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-44 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Add New Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-xs transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar matching Screenshot */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-1.5 overflow-x-auto">
        <div className="flex items-center space-x-1 min-w-max">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400 dark:text-zinc-500'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                  isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE CARD LIST (md:hidden) */}
      <div className="md:hidden space-y-3">
        {activeSubTab === 'products' && products
          .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((p) => (
            <div key={p.id} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-slate-400 font-bold uppercase">{p.id}</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.name}</div>
                </div>
                <div className="flex items-center shrink-0 space-x-0.5">
                  <CardIconBtn onClick={() => handleOpenEdit(p, 'product')} title="Edit Product"><Edit className="w-4 h-4" /></CardIconBtn>
                  <CardIconBtn danger title="Delete Product" onClick={() => { if (confirm(`Are you sure you want to delete product "${p.name}"?`)) deleteProduct(p.id); }}><Trash2 className="w-4 h-4" /></CardIconBtn>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
                <Field label="Category" value={p.category} accent="text-indigo-600 dark:text-indigo-400" />
                <Field label="Required Fields" value={p.deliveryMethod} />
                <Field label="Fixed Cost" mono value={p.costPrice ? `${p.costPrice.toLocaleString()} MMK` : '-'} />
                <Field label="Selling Price" mono accent="text-orange-600 dark:text-orange-400" value={p.sellingPrice ? `${p.sellingPrice.toLocaleString()} MMK` : '-'} />
                <Field label="Household" mono value={p.householdCode || `Default (${p.plan})`} />
              </div>
            </div>
          ))}

        {activeSubTab === 'categories' && categoriesList.map((cat) => (
          <div key={cat.code} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-slate-400 font-bold">{cat.code}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{cat.name}</div>
              </div>
              <div className="flex items-center shrink-0 space-x-0.5">
                <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  {cat.count} Products
                </span>
                <CardIconBtn title="Edit"><Edit className="w-4 h-4" /></CardIconBtn>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
              <Field label="Description" value={cat.note} />
            </div>
          </div>
        ))}

        {activeSubTab === 'households' && households.map((h) => (
          <div key={h.id} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-orange-600 dark:text-orange-400 font-extrabold">{h.code}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{h.name}</div>
              </div>
              <div className="flex items-center shrink-0 space-x-0.5">
                <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active Pool</span>
                <CardIconBtn onClick={() => handleOpenEdit(h, 'household')} title="Edit Household"><Edit className="w-4 h-4" /></CardIconBtn>
                <CardIconBtn danger title="Delete Household" onClick={() => { if (confirm(`Delete household ${h.name}?`)) deleteHousehold(h.id); }}><Trash2 className="w-4 h-4" /></CardIconBtn>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
              <Field label="Admin Note" value={h.adminNote || 'Active family slot'} />
            </div>
          </div>
        ))}

        {activeSubTab === 'plans' && plansList.map((plan) => (
          <div key={plan.code} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-slate-400 font-bold">{plan.code}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{plan.name}</div>
              </div>
              <div className="flex items-center shrink-0 space-x-0.5">
                <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">{plan.duration} Days</span>
                <CardIconBtn title="Edit"><Edit className="w-4 h-4" /></CardIconBtn>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
              <Field label="Auto Renew" accent={plan.autoRenew ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'} value={plan.autoRenew ? 'Enabled' : 'Manual'} />
              <Field label="Description" value={plan.note} />
            </div>
          </div>
        ))}

        {activeSubTab === 'suppliers' && suppliers.map((s) => (
          <div key={s.id} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-orange-600 dark:text-orange-400 font-extrabold">{s.code}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{s.name}</div>
              </div>
              <div className="flex items-center shrink-0 space-x-0.5">
                <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Verified</span>
                <CardIconBtn onClick={() => handleOpenEdit(s, 'supplier')} title="Edit Supplier"><Edit className="w-4 h-4" /></CardIconBtn>
                <CardIconBtn danger title="Delete Supplier" onClick={() => { if (confirm(`Delete supplier ${s.name}?`)) deleteSupplier(s.id); }}><Trash2 className="w-4 h-4" /></CardIconBtn>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
              <Field label="Admin Note / Contact" value={s.adminNote || 'Verified key distributor'} />
            </div>
          </div>
        ))}

        {activeSubTab === 'discounts' && discountsList.map((d) => (
          <div key={d.code} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-slate-400 font-bold">{d.code}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{d.name}</div>
              </div>
              <div className="flex items-center shrink-0 space-x-0.5">
                <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{d.amount}</span>
                <CardIconBtn title="Edit"><Edit className="w-4 h-4" /></CardIconBtn>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
              <Field label="Type" value={d.type} />
              <Field label="Note" value={d.note} />
            </div>
          </div>
        ))}

        {activeSubTab === 'reminders' && remindersList.map((rem) => (
          <div key={rem.code} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-slate-400 font-bold">{rem.code}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{rem.name}</div>
              </div>
              <div className="flex items-center shrink-0 space-x-0.5">
                <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{rem.status}</span>
                <CardIconBtn title="Edit"><Edit className="w-4 h-4" /></CardIconBtn>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
              <Field label="Trigger" mono accent="text-orange-600 dark:text-orange-400" value={rem.trigger} />
              <Field label="Description" value={rem.note} />
            </div>
          </div>
        ))}

        {activeSubTab === 'automations' && automationsList.map((auto) => (
          <div key={auto.code} className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-slate-400 font-bold">{auto.code}</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{auto.name}</div>
              </div>
              <div className="flex items-center shrink-0 space-x-0.5">
                <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{auto.status}</span>
                <CardIconBtn title="Edit"><Edit className="w-4 h-4" /></CardIconBtn>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-zinc-800">
              <Field label="Trigger Event" value={auto.trigger} />
              <Field label="Automated Action" accent="text-orange-600 dark:text-orange-400" value={auto.action} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Content Container (md+) */}
      <div className="hidden md:block bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          
          {/* TAB 1: PRODUCTS TABLE */}
          {activeSubTab === 'products' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">PRODUCT CODE</th>
                  <th className="py-3.5 px-4">PRODUCT NAME</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4">REQUIRED DYNAMIC FIELDS</th>
                  <th className="py-3.5 px-4 font-mono text-right">FIXED COST (MMK)</th>
                  <th className="py-3.5 px-4 font-mono text-right">SELLING PRICE (MMK)</th>
                  <th className="py-3.5 px-4">ADMIN NOTE</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {products
                  .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-zinc-400">{p.id.toUpperCase()}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap inline-block">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-zinc-300">
                        {p.deliveryMethod === 'Activation Link' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            Activation Link
                          </span>
                        ) : p.deliveryMethod === 'Invite Email' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            Invite Email
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                            Email & Password
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-500 dark:text-zinc-400">
                        {p.costPrice ? p.costPrice.toLocaleString() : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-orange-600 dark:text-orange-400">
                        {p.sellingPrice ? p.sellingPrice.toLocaleString() : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                        Household: <span className="font-mono text-slate-700 dark:text-zinc-200 font-bold">{p.householdCode || 'Default'}</span> ({p.plan})
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEdit(p, 'product')}
                            className="p-1.5 text-slate-400 hover:text-orange-500 transition rounded-lg hover:bg-orange-50 dark:hover:bg-zinc-800"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete product "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-50 dark:hover:bg-zinc-800"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 2: CATEGORIES TABLE */}
          {activeSubTab === 'categories' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">CATEGORY CODE</th>
                  <th className="py-3.5 px-4">CATEGORY NAME</th>
                  <th className="py-3.5 px-4 text-center">ACTIVE PRODUCTS</th>
                  <th className="py-3.5 px-4">DESCRIPTION / NOTE</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {categoriesList.map((cat) => (
                  <tr key={cat.code} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-zinc-400">{cat.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-orange-600 dark:text-orange-400">{cat.count} Products</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{cat.note}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-orange-500 transition">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 3: HOUSEHOLDS TABLE */}
          {activeSubTab === 'households' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">HOUSEHOLD CODE</th>
                  <th className="py-3.5 px-4">HOUSEHOLD NAME</th>
                  <th className="py-3.5 px-4">ADMIN NOTE</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {households.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-orange-600 dark:text-orange-400">{h.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{h.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{h.adminNote || 'Active family slot'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Active Pool
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(h, 'household')}
                          className="p-1.5 text-slate-400 hover:text-orange-500 transition rounded-lg hover:bg-orange-50 dark:hover:bg-zinc-800"
                          title="Edit Household"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete household ${h.name}?`)) deleteHousehold(h.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-50 dark:hover:bg-zinc-800"
                          title="Delete Household"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 4: PLANS TABLE */}
          {activeSubTab === 'plans' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">PLAN CODE</th>
                  <th className="py-3.5 px-4">PLAN NAME</th>
                  <th className="py-3.5 px-4 text-center font-mono">DURATION</th>
                  <th className="py-3.5 px-4 text-center">AUTO RENEW</th>
                  <th className="py-3.5 px-4">DESCRIPTION</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {plansList.map((plan) => (
                  <tr key={plan.code} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-zinc-400">{plan.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{plan.name}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-zinc-300">{plan.duration} Days</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${plan.autoRenew ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
                        {plan.autoRenew ? 'Enabled' : 'Manual'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{plan.note}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-orange-500 transition rounded-lg hover:bg-orange-50 dark:hover:bg-zinc-800">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 5: SUPPLIERS TABLE */}
          {activeSubTab === 'suppliers' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">SUPPLIER CODE</th>
                  <th className="py-3.5 px-4">SUPPLIER NAME</th>
                  <th className="py-3.5 px-4">ADMIN NOTE / CONTACT</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">{s.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{s.adminNote || 'Verified key distributor'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Verified Supplier
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(s, 'supplier')}
                          className="p-1.5 text-slate-400 hover:text-orange-500 transition rounded-lg hover:bg-orange-50 dark:hover:bg-zinc-800"
                          title="Edit Supplier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete supplier ${s.name}?`)) deleteSupplier(s.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-50 dark:hover:bg-zinc-800"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 6: DISCOUNTS TABLE */}
          {activeSubTab === 'discounts' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">DISCOUNT CODE</th>
                  <th className="py-3.5 px-4">RULE NAME</th>
                  <th className="py-3.5 px-4 font-mono">VALUE</th>
                  <th className="py-3.5 px-4">TYPE</th>
                  <th className="py-3.5 px-4">NOTE</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {discountsList.map((d) => (
                  <tr key={d.code} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-zinc-400">{d.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{d.name}</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{d.amount}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{d.type}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{d.note}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-orange-500 transition">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 7: REMINDERS TABLE */}
          {activeSubTab === 'reminders' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">RULE ID</th>
                  <th className="py-3.5 px-4">REMINDER NAME</th>
                  <th className="py-3.5 px-4">TRIGGER CONDITION</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4">DESCRIPTION</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {remindersList.map((rem) => (
                  <tr key={rem.code} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-zinc-400">{rem.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{rem.name}</td>
                    <td className="py-3.5 px-4 font-mono text-orange-600 dark:text-orange-400 font-semibold">{rem.trigger}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {rem.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{rem.note}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-orange-500 transition">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 8: AUTOMATIONS TABLE */}
          {activeSubTab === 'automations' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">AUTOMATION CODE</th>
                  <th className="py-3.5 px-4">WORKFLOW NAME</th>
                  <th className="py-3.5 px-4">TRIGGER EVENT</th>
                  <th className="py-3.5 px-4">AUTOMATED ACTION</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
                {automationsList.map((auto) => (
                  <tr key={auto.code} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-zinc-400">{auto.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{auto.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{auto.trigger}</td>
                    <td className="py-3.5 px-4 font-semibold text-orange-600 dark:text-orange-400">{auto.action}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {auto.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-orange-500 transition">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* Add New Modal matching activeSubTab */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs">
          <div className="my-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Add New {subTabs.find(t => t.id === activeSubTab)?.label} Entry
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {activeSubTab === 'products' && (
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. CapCut Pro"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Streaming">Streaming</option>
                      <option value="Design & Video">Design & Video</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Music">Music</option>
                      <option value="AI Tools">AI Tools</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Delivery Method</label>
                    <select
                      value={productForm.deliveryMethod}
                      onChange={(e) => setProductForm({ ...productForm, deliveryMethod: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Email & Password">Email & Password</option>
                      <option value="Activation Link">Activation Link</option>
                      <option value="Invite Email">Invite Email</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Cost Price (MMK)</label>
                    <input
                      type="number"
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Selling Price (MMK)</label>
                    <input
                      type="number"
                      value={productForm.sellingPrice}
                      onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Household Code</label>
                  <input
                    type="text"
                    value={productForm.householdCode}
                    onChange={(e) => setProductForm({ ...productForm, householdCode: e.target.value })}
                    placeholder="e.g. CC-FAM-01"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-2xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-extrabold"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            )}

            {activeSubTab === 'households' && (
              <form onSubmit={handleAddHousehold} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Household Pool Name</label>
                  <input
                    type="text"
                    required
                    value={householdForm.name}
                    onChange={(e) => setHouseholdForm({ ...householdForm, name: e.target.value })}
                    placeholder="e.g. CapCut Family Pool C"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Household Code</label>
                  <input
                    type="text"
                    required
                    value={householdForm.code}
                    onChange={(e) => setHouseholdForm({ ...householdForm, code: e.target.value })}
                    placeholder="e.g. CC-FAM-03"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Admin Note</label>
                  <input
                    type="text"
                    value={householdForm.adminNote}
                    onChange={(e) => setHouseholdForm({ ...householdForm, adminNote: e.target.value })}
                    placeholder="Slot details / region"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-2xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-extrabold"
                  >
                    Save Household
                  </button>
                </div>
              </form>
            )}

            {activeSubTab === 'suppliers' && (
              <form onSubmit={handleAddSupplier} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="e.g. Direct Keys Wholesale SG"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Supplier Code</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.code}
                    onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value })}
                    placeholder="e.g. SUP05"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Contact Note</label>
                  <input
                    type="text"
                    value={supplierForm.adminNote}
                    onChange={(e) => setSupplierForm({ ...supplierForm, adminNote: e.target.value })}
                    placeholder="WhatsApp / Telegram contact"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-2xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-extrabold"
                  >
                    Save Supplier
                  </button>
                </div>
              </form>
            )}

            {(activeSubTab !== 'products' && activeSubTab !== 'households' && activeSubTab !== 'suppliers') && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  New master record entry for <span className="font-bold text-orange-500">{activeSubTab}</span> will automatically sync with local database.
                </p>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-extrabold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="my-auto bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in-scale max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Edit className="w-4 h-4 text-orange-500" />
                <span>Edit {editingItem.itemType?.toUpperCase()} ({editingItem.name || editingItem.code})</span>
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              {editingItem.itemType === 'product' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                      >
                        <option value="Streaming">Streaming</option>
                        <option value="Design & Video">Design & Video</option>
                        <option value="Productivity">Productivity</option>
                        <option value="Music">Music</option>
                        <option value="AI Tools">AI Tools</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Delivery Method</label>
                      <select
                        value={editForm.deliveryMethod}
                        onChange={(e) => setEditForm({ ...editForm, deliveryMethod: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                      >
                        <option value="Email & Password">Email & Password</option>
                        <option value="Activation Link">Activation Link</option>
                        <option value="Invite Email">Invite Email</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Cost Price (MMK)</label>
                      <input
                        type="number"
                        value={editForm.costPrice}
                        onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Selling Price (MMK)</label>
                      <input
                        type="number"
                        value={editForm.sellingPrice}
                        onChange={(e) => setEditForm({ ...editForm, sellingPrice: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Household Code</label>
                    <input
                      type="text"
                      value={editForm.householdCode}
                      onChange={(e) => setEditForm({ ...editForm, householdCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </>
              )}

              {(editingItem.itemType === 'household' || editingItem.itemType === 'supplier') && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Code</label>
                    <input
                      type="text"
                      required
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Admin Note</label>
                    <input
                      type="text"
                      value={editForm.adminNote}
                      onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-2xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-orange-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
