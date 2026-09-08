import React, { useState } from 'react';
import { useErpStore } from '../store/useErpStore';
import { Users, UserPlus, Star, Phone, Mail, Globe, Search, Edit, Trash2, Plus, MessageSquare } from 'lucide-react';

export default function CustomerCrm() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useErpStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    telegramUsername: '',
    platform: 'Facebook',
    customPlatform: '',
    isVIP: false,
    note: '',
    customFields: [], // [{ label: '', value: '' }]
  });

  const handleAddCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), { label: '', value: '' }]
    }));
  };

  const handleCustomFieldChange = (index, field, val) => {
    setFormData((prev) => {
      const updated = [...(prev.customFields || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, customFields: updated };
    });
  };

  const handleRemoveCustomField = (index) => {
    setFormData((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPlatform = formData.platform === 'CUSTOM' ? (formData.customPlatform || 'Custom') : formData.platform;
    addCustomer({
      ...formData,
      platform: finalPlatform,
    });
    setFormData({
      name: '',
      phone: '',
      email: '',
      telegramUsername: '',
      platform: 'Facebook',
      customPlatform: '',
      isVIP: false,
      note: '',
      customFields: [],
    });
    setShowAddModal(false);
  };

  const handleOpenEdit = (customer) => {
    const isStandardPlatform = ['Facebook', 'Telegram', 'Viber', 'TikTok', 'Direct'].includes(customer.platform);
    setEditingCustomer({
      ...customer,
      platformSelection: isStandardPlatform ? customer.platform : 'CUSTOM',
      customPlatform: isStandardPlatform ? '' : customer.platform,
      telegramUsername: customer.telegramUsername || '',
      customFields: customer.customFields || [],
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const finalPlatform = editingCustomer.platformSelection === 'CUSTOM' 
      ? (editingCustomer.customPlatform || 'Custom') 
      : editingCustomer.platformSelection;

    updateCustomer(editingCustomer.id, {
      name: editingCustomer.name,
      phone: editingCustomer.phone,
      email: editingCustomer.email,
      telegramUsername: editingCustomer.telegramUsername,
      platform: finalPlatform,
      isVIP: editingCustomer.isVIP,
      note: editingCustomer.note,
      customFields: editingCustomer.customFields || [],
    });
    setEditingCustomer(null);
  };

  const handleEditCustomFieldAdd = () => {
    setEditingCustomer((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), { label: '', value: '' }]
    }));
  };

  const handleEditCustomFieldChange = (index, field, val) => {
    setEditingCustomer((prev) => {
      const updated = [...(prev.customFields || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, customFields: updated };
    });
  };

  const handleEditCustomFieldRemove = (index) => {
    setEditingCustomer((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).filter((_, i) => i !== index)
    }));
  };

  const filteredCustomers = customers.filter(c => 
    !searchQuery || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.telegramUsername && c.telegramUsername.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-12">
      
      {/* Sleek Compact Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Customer Directory</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {customers.length}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer..."
              className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition shadow-sm shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Pure Table List View with optimized column widths & clear Edit/Delete actions */}
      <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-2.5 font-mono w-8 text-center whitespace-nowrap">NO.</th>
                <th className="py-3 px-2.5 font-mono whitespace-nowrap">CUSTOMER ID</th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[160px]">CUSTOMER NAME</th>
                <th className="py-3 px-2.5 font-mono whitespace-nowrap">PHONE</th>
                <th className="py-3 px-2.5 whitespace-nowrap">EMAIL</th>
                <th className="py-3 px-2.5 whitespace-nowrap">PLATFORM</th>
                <th className="py-3 px-2.5 text-center whitespace-nowrap">STATUS</th>
                <th className="py-3 px-2.5 font-mono text-right whitespace-nowrap">TOTAL SPENT</th>
                <th className="py-3 px-2.5 whitespace-nowrap">NOTE</th>
                <th className="py-3 px-3 text-center whitespace-nowrap sticky right-0 bg-slate-50 dark:bg-zinc-900 shadow-xs z-10">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-sans">
              {filteredCustomers.map((c, index) => (
                <tr key={c.id} className="hover:bg-indigo-50/30 dark:hover:bg-zinc-900/60 transition group">
                  <td className="py-3 px-2.5 font-mono font-bold text-center text-slate-400 dark:text-zinc-500 whitespace-nowrap">{index + 1}.</td>
                  <td className="py-3 px-2.5 font-mono font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{c.id}</td>
                  
                  {/* Optimized Customer Name Column - Allows clean wrapping without truncation */}
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white min-w-[160px] max-w-[220px]">
                    <div className="flex flex-wrap items-center gap-1.5 leading-snug">
                      <span className="break-words">{c.name}</span>
                      {c.isVIP && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center space-x-0.5 shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>VIP</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-2.5 font-mono text-slate-700 dark:text-zinc-300 whitespace-nowrap font-medium">
                    {c.phone || '-'}
                  </td>

                  <td className="py-3 px-2.5 text-slate-600 dark:text-zinc-300 max-w-[170px]">
                    <div className="truncate" title={c.email || ''}>{c.email || '-'}</div>
                    {c.telegramUsername && (
                      <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-bold truncate" title={c.telegramUsername}>
                        {c.telegramUsername.startsWith('@') ? c.telegramUsername : `@${c.telegramUsername}`}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-block">
                      {c.platform || 'Facebook'}
                    </span>
                  </td>

                  <td className="py-3 px-2.5 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold inline-block ${
                      c.isVIP 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {c.isVIP ? 'VIP Client' : 'Active'}
                    </span>
                  </td>

                  <td className="py-3 px-2.5 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {(c.totalSpent || 0).toLocaleString()} MMK
                  </td>

                  <td className="py-3 px-2.5 text-slate-500 dark:text-zinc-400 max-w-[140px]">
                    <div className="truncate" title={c.note || ''}>{c.note || '-'}</div>
                    {c.customFields && c.customFields.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {c.customFields.map((f, fi) => (
                          <span key={fi} className="px-1.5 py-0.2 bg-slate-100 dark:bg-zinc-800 text-[9px] font-mono rounded text-slate-600 dark:text-zinc-300">
                            {f.label}: {f.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Sticky Actions Column - Always Visible with Colorful Prominent Buttons */}
                  <td className="py-3 px-3 text-center whitespace-nowrap sticky right-0 bg-white dark:bg-[#09090b] group-hover:bg-indigo-50/30 dark:group-hover:bg-zinc-900/60 shadow-xs z-10 border-l border-slate-100 dark:border-zinc-800/60">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition flex items-center space-x-1 border border-indigo-200 dark:border-indigo-800"
                        title="Edit Customer Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
                            deleteCustomer(c.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-lg transition border border-rose-200 dark:border-rose-800"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Full Customer Profile Creation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl my-8">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Create New Customer Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ko Aung Ko"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09..."
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Channel</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Viber">Viber</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Direct">Direct</option>
                    <option value="CUSTOM">+ Add Custom</option>
                  </select>
                </div>
              </div>

              {/* Custom Platform Input when + Add Custom is selected */}
              {formData.platform === 'CUSTOM' && (
                <div>
                  <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Custom Platform Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customPlatform}
                    onChange={(e) => setFormData({ ...formData, customPlatform: e.target.value })}
                    placeholder="e.g. Instagram, WhatsApp, Website..."
                    className="w-full bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@gmail.com"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telegram Username</label>
                  <input
                    type="text"
                    value={formData.telegramUsername}
                    onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                    placeholder="@username"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Notes / Preferences</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Regular buyer for CapCut, prefers 1-Year plans..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Dynamic Add More Custom Fields Section */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Attributes</span>
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-extrabold flex items-center space-x-1 hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>[Add More]</span>
                  </button>
                </div>

                {formData.customFields && formData.customFields.map((cf, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Field Name (e.g. Line ID)"
                      value={cf.label}
                      onChange={(e) => handleCustomFieldChange(idx, 'label', e.target.value)}
                      className="w-1/2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={cf.value}
                      onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                      className="w-1/2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isVIP"
                  checked={formData.isVIP}
                  onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="isVIP" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Mark as VIP Customer
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold"
                >
                  Save Full Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl animate-fade-in-scale my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Edit className="w-4 h-4 text-indigo-500" />
                <span>Edit Customer ({editingCustomer.id})</span>
              </h2>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Channel</label>
                  <select
                    value={editingCustomer.platformSelection || 'Facebook'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, platformSelection: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Viber">Viber</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Direct">Direct</option>
                    <option value="CUSTOM">+ Add Custom</option>
                  </select>
                </div>
              </div>

              {/* Custom Platform Input when CUSTOM is selected */}
              {editingCustomer.platformSelection === 'CUSTOM' && (
                <div>
                  <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Custom Platform Name</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.customPlatform || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, customPlatform: e.target.value })}
                    placeholder="e.g. Instagram, WhatsApp, Website..."
                    className="w-full bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telegram Username</label>
                  <input
                    type="text"
                    value={editingCustomer.telegramUsername || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, telegramUsername: e.target.value })}
                    placeholder="@username"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Notes / Preferences</label>
                <textarea
                  value={editingCustomer.note || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, note: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Dynamic Add More Custom Fields Section */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Attributes</span>
                  <button
                    type="button"
                    onClick={handleEditCustomFieldAdd}
                    className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-extrabold flex items-center space-x-1 hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>[Add More]</span>
                  </button>
                </div>

                {editingCustomer.customFields && editingCustomer.customFields.map((cf, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Field Name"
                      value={cf.label}
                      onChange={(e) => handleEditCustomFieldChange(idx, 'label', e.target.value)}
                      className="w-1/2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={cf.value}
                      onChange={(e) => handleEditCustomFieldChange(idx, 'value', e.target.value)}
                      className="w-1/2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleEditCustomFieldRemove(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsVIP"
                  checked={!!editingCustomer.isVIP}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, isVIP: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="editIsVIP" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Mark as VIP Customer
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold"
                >
                  Update Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
