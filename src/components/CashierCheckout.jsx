import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { format, addDays } from 'date-fns';
import { 
  Receipt, 
  UserCheck, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2,
  Lock,
  Mail,
  Building2,
  Tag,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CashierCheckout() {
  const { products, customers, addOrder, setActiveReceipt, setActiveTab } = useErpStore();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const defaultEndDateStr = selectedProduct 
    ? format(addDays(new Date(), selectedProduct.durationDays || 30), 'yyyy-MM-dd')
    : todayStr;

  const [formData, setFormData] = useState({
    customerName: '',
    contactInfo: '',
    accountEmail: '',
    accountPassword: '',
    householdCode: selectedProduct?.householdCode || '',
    startDate: todayStr,
    endDate: defaultEndDateStr,
    warrantyDays: selectedProduct?.durationDays || 30,
    costPrice: selectedProduct?.costPrice || 0,
    sellingPrice: selectedProduct?.sellingPrice || 0,
    discount: 0,
    notes: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setFormData((prev) => ({
        ...prev,
        householdCode: prod.householdCode || prev.householdCode,
        warrantyDays: prod.durationDays || 30,
        costPrice: prod.costPrice || 0,
        sellingPrice: prod.sellingPrice || 0,
        endDate: format(addDays(new Date(prev.startDate), prod.durationDays || 30), 'yyyy-MM-dd'),
      }));
    }
  };

  const handleCustomerChange = (custId) => {
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setFormData((prev) => ({
        ...prev,
        customerName: cust.name,
        contactInfo: cust.phone || cust.email,
        discount: cust.isVIP ? 500 : prev.discount,
      }));
    }
  };

  const netProfit = (Number(formData.sellingPrice) || 0) - (Number(formData.costPrice) || 0) - (Number(formData.discount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newOrder = addOrder({
      customerId: selectedCustomerId || 'GUEST',
      customerName: formData.customerName || 'Walk-in Customer',
      contactInfo: formData.contactInfo || 'N/A',
      category: selectedProduct.category,
      productName: selectedProduct.name,
      plan: selectedProduct.plan,
      accountEmail: formData.accountEmail,
      accountPassword: formData.accountPassword,
      householdCode: formData.householdCode,
      startDate: formData.startDate,
      endDate: formData.endDate,
      warrantyDays: Number(formData.warrantyDays) || 30,
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      discount: Number(formData.discount) || 0,
      notes: formData.notes,
    });

    setIsSuccess(true);
    setActiveReceipt(newOrder);

    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      


      {/* Main Cashier Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Product & Plan Selection */}
          <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors duration-200">
            <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                1
              </div>
              <span>Choose Product & Plan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Product Plan</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                >
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.plan}) — {prod.sellingPrice.toLocaleString()} MMK
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Household Code System</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={formData.householdCode}
                    onChange={(e) => setFormData({ ...formData, householdCode: e.target.value })}
                    placeholder="e.g. CC-FAM-01, NF-HOUSE-05"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Category: <strong className="text-slate-900 dark:text-white">{selectedProduct.category}</strong></span>
                <span>Default Duration: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedProduct.durationDays} Days</strong></span>
                <span>Est Cost: <strong className="text-amber-600 dark:text-amber-400 font-bold">{selectedProduct.costPrice.toLocaleString()} MMK</strong></span>
              </div>
            )}
          </div>

          {/* 2. Customer Credentials & Delivery Method */}
          <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors duration-200">
            <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                2
              </div>
              <span>Customer Credentials & Delivery Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Existing Customer (Optional)</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                >
                  <option value="">-- Walk-in / Guest Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) {c.isVIP ? '⭐ VIP' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Customer Name & Contact</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Ko Aung Ko (09450000000)"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sales Platform</label>
                <select
                  value={formData.platform || 'Facebook Page'}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
                >
                  <option value="Facebook Page">Facebook Page</option>
                  <option value="Telegram">Telegram Channel / DM</option>
                  <option value="TikTok">TikTok Store</option>
                  <option value="Viber">Viber Community</option>
                  <option value="Web Direct">Web Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Delivery Method</label>
                <select
                  value={formData.deliveryMethod || 'Email & Password'}
                  onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold focus:outline-none"
                >
                  <option value="Email & Password">Email & Password (Direct Login)</option>
                  <option value="Activation Link">Activation Link / License Key</option>
                  <option value="Invite Email">Invite Link / Email Invitation</option>
                </select>
              </div>

              {/* Dynamic Credentials Inputs based on Delivery Method */}
              {formData.deliveryMethod === 'Activation Link' ? (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Activation URL / License Key</label>
                  <input
                    type="text"
                    required
                    value={formData.activationUrl || ''}
                    onChange={(e) => setFormData({ ...formData, activationUrl: e.target.value })}
                    placeholder="https://canva.com/brand/join?code=..."
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              ) : formData.deliveryMethod === 'Invite Email' ? (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Family Member Email to Invite</label>
                  <input
                    type="email"
                    required
                    value={formData.accountEmail || ''}
                    onChange={(e) => setFormData({ ...formData, accountEmail: e.target.value })}
                    placeholder="customer_invite@gmail.com"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Email / Login</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-3.5" />
                      <input
                        type="text"
                        required
                        value={formData.accountEmail}
                        onChange={(e) => setFormData({ ...formData, accountEmail: e.target.value })}
                        placeholder="account@gmail.com"
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-3.5" />
                      <input
                        type="text"
                        required
                        value={formData.accountPassword}
                        onChange={(e) => setFormData({ ...formData, accountPassword: e.target.value })}
                        placeholder="Pass#12345"
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Dates & Warranty */}
          <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors duration-200">
            <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <span>Start / End Date & Warranty Days</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Warranty Days</label>
                <input
                  type="number"
                  value={formData.warrantyDays}
                  onChange={(e) => setFormData({ ...formData, warrantyDays: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition font-mono font-bold"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Financial Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm sticky top-24 transition-colors duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-base">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Financial Calculator</span>
              </div>
              <span className="px-2.5 py-1 text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full">
                Real-time
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Selling Price (MMK)</label>
                <input
                  type="number"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-lg font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cost Price / อရင်းစျေး (MMK)</label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Discount (MMK)</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition font-mono"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-950 text-white rounded-2xl p-5 space-y-3 shadow-lg border border-slate-800">
              <div className="flex justify-between text-xs text-indigo-200 font-medium">
                <span>Final Client Pay:</span>
                <span className="text-white font-mono font-bold">
                  {((Number(formData.sellingPrice) || 0) - (Number(formData.discount) || 0)).toLocaleString()} MMK
                </span>
              </div>
              <div className="flex justify-between text-xs text-indigo-200 font-medium">
                <span>Cost Price:</span>
                <span className="text-indigo-300 font-mono">
                  -{(Number(formData.costPrice) || 0).toLocaleString()} MMK
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-100">Net Profit (အသားတင်):</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400">
                  +{netProfit.toLocaleString()} MMK
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-98"
            >
              <Receipt className="w-5 h-5" />
              <span>Issue Slip & Save Order</span>
            </button>

            {isSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3.5 rounded-2xl text-xs flex items-center space-x-2 font-bold shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Order successfully registered & slip generated!</span>
              </div>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
