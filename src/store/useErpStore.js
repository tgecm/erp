import { create } from 'zustand';
import { addDays, format, parseISO } from 'date-fns';

const API_BASE = typeof window !== 'undefined'
  ? (window.location.port === '3000' ? 'http://localhost:4000/api' : '/api')
  : '/api';

const defaultVisibleColumns = {
  recordNo: true,
  createdDate: false,
  updatedDate: false,
  orderDate: false,
  orderId: true,
  receiptId: true,
  trackingId: false,
  salesChannel: false,
  platform: true,
  cashier: false,
  orderStatus: true,
  customerId: false,
  customerName: true,
  customerType: false,
  customerStatus: false,
  purchaseCount: false,
  category: false,
  productName: true,
  productCode: false,
  productVersion: false,
  planName: false,
  householdCode: true,
  costPrice: false,
  sellingPrice: true,
  discount: false,
  netProfit: true,
  startDate: true,
  endDate: true,
  remainingDays: true,
};

// Date Cache to make getRemainingWarrantyDays lightning fast
const dateCache = new Map();
const todayMs = new Date().setHours(0,0,0,0);

export const useErpStore = create((set, get) => ({
  activeTab: 'dashboard', // dashboard, cashier, database, warranty, refunds, customers, brain, finance
  setActiveTab: (tab) => set({ activeTab: tab, isMobileMenuOpen: false }),

  // Auth State
  user: (() => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem('cm_user');
      if (!item || item === 'undefined' || item === 'null') return null;
      return JSON.parse(item);
    } catch (e) {
      console.error('Error loading cm_user:', e);
      return null;
    }
  })(),
  token: (() => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem('cm_token');
      if (!item || item === 'undefined' || item === 'null') return null;
      return item;
    } catch (e) {
      return null;
    }
  })(),

  login: async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Backend response invalid. Please check server connection.');
      }
      if (!res.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || 'Invalid credentials.',
          requiresVerification: data.requiresVerification,
          email: data.email
        };
      }
      if (typeof window !== 'undefined' && data.user) {
        try {
          localStorage.setItem('cm_user', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('cm_token', data.token);
        } catch (e) {
          console.error('Error saving session:', e);
        }
      }
      set({ user: data.user || null, token: data.token || null });
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cm_user');
        localStorage.removeItem('cm_token');
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    set({ user: null, token: null, activeTab: 'dashboard', isMobileMenuOpen: false });
  },

  // Theme State
  theme: typeof window !== 'undefined' ? (localStorage.getItem('dc_theme') || 'light') : 'light',
  toggleTheme: () => {
    const current = get().theme;
    const nextTheme = current === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('dc_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: nextTheme });
  },

  // Mobile Drawer State
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Column Visibility Checkboxes State
  visibleColumns: defaultVisibleColumns,
  toggleColumnVisibility: (colKey) => set((state) => ({
    visibleColumns: {
      ...state.visibleColumns,
      [colKey]: !state.visibleColumns[colKey]
    }
  })),

  applyPreset: (presetName) => {
    if (presetName === 'Compact') {
      set({
        visibleColumns: {
          ...defaultVisibleColumns,
          recordNo: true,
          orderId: true,
          receiptId: true,
          customerName: true,
          productName: true,
          sellingPrice: true,
          netProfit: true,
          remainingDays: true,
          platform: false,
          householdCode: false,
          startDate: false,
          endDate: false,
        }
      });
    } else if (presetName === 'Detailed') {
      const allTrue = {};
      Object.keys(defaultVisibleColumns).forEach((k) => { allTrue[k] = true; });
      set({ visibleColumns: allTrue });
    } else if (presetName === 'Financial') {
      set({
        visibleColumns: {
          ...defaultVisibleColumns,
          recordNo: true,
          orderId: true,
          receiptId: true,
          customerName: true,
          productName: true,
          costPrice: true,
          sellingPrice: true,
          discount: true,
          netProfit: true,
          platform: true,
        }
      });
    } else if (presetName === 'Warranty') {
      set({
        visibleColumns: {
          ...defaultVisibleColumns,
          recordNo: true,
          receiptId: true,
          customerName: true,
          productName: true,
          startDate: true,
          endDate: true,
          remainingDays: true,
          orderStatus: true,
        }
      });
    } else {
      set({ visibleColumns: defaultVisibleColumns });
    }
  },

  // Live Database Collections
  orders: [],
  products: [],
  customers: [],
  households: [],
  suppliers: [],
  isLoadingDb: false,
  dbError: null,

  // Fast Async Store Hydration
  fetchDb: async () => {
    set({ isLoadingDb: true, dbError: null });
    try {
      const res = await fetch(`${API_BASE}/all`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      set({
        orders: data.orders || [],
        products: data.products || [],
        customers: data.customers || [],
        households: data.households || [],
        suppliers: data.suppliers || [],
        isLoadingDb: false,
      });
    } catch (err) {
      console.warn('Backend connection warning:', err);
      set({ isLoadingDb: false, dbError: err.message });
    }
  },

  // Add Household (Instant Optimistic UI)
  addHousehold: (h) => {
    const newHousehold = { ...h, id: `h${get().households.length + 1}` };
    set((state) => ({ households: [...state.households, newHousehold] }));
    fetch(`${API_BASE}/households`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHousehold),
    }).catch(err => console.warn(err));
  },

  // Add Supplier (Instant Optimistic UI)
  addSupplier: (s) => {
    const newSupplier = { ...s, id: `s${get().suppliers.length + 1}` };
    set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
    fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSupplier),
    }).catch(err => console.warn(err));
  },

  // Receipt Modal State
  activeReceipt: null,
  setActiveReceipt: (receipt) => set({ activeReceipt: receipt }),

  // Add New Order (Instant 0ms Optimistic UI)
  addOrder: (newOrderData) => {
    const state = get();
    const id = `ORD-2026-${String(state.orders.length + 804).padStart(4, '0')}`;
    const receiptId = `REC-${Math.floor(1000 + Math.random() * 9000)}`;

    const cost = Number(newOrderData.costPrice || 0);
    const selling = Number(newOrderData.sellingPrice || 0);
    const discount = Number(newOrderData.discount || 0);
    const netProfit = selling - cost - discount;

    const newOrder = {
      ...newOrderData,
      id,
      receiptId,
      costPrice: cost,
      sellingPrice: selling,
      discount,
      netProfit,
      status: 'Completed',
      isReminded: false,
      extensionCount: 0,
      credentialHistory: [],
    };

    set({ orders: [newOrder, ...state.orders] });
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(err => console.warn(err));

    return newOrder;
  },

  // Toggle Is Reminded status (INSTANT 0ms Optimistic UI Toggle)
  toggleReminded: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) => o.id === orderId ? { ...o, isReminded: !o.isReminded } : o)
    }));

    // Async Fire-and-Forget Sync
    fetch(`${API_BASE}/orders/${orderId}/toggle-reminded`, { method: 'PUT' })
      .catch(e => console.warn('Sync error:', e));
  },

  // Extend Subscription (Instant 0ms Optimistic UI)
  extendSubscription: (orderId, newCredentialData) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const archiveCred = {
          date: format(new Date(), 'yyyy-MM-dd HH:mm'),
          deliveryMethod: o.deliveryMethod,
          accountEmail: o.accountEmail,
          accountPassword: o.accountPassword,
          activationUrl: o.activationUrl,
        };
        const currentEnd = parseISO(o.endDate || todayStr);
        const newEnd = format(addDays(currentEnd, 30), 'yyyy-MM-dd');

        return {
          ...o,
          accountEmail: newCredentialData.accountEmail || o.accountEmail,
          accountPassword: newCredentialData.accountPassword || o.accountPassword,
          activationUrl: newCredentialData.activationUrl || o.activationUrl,
          endDate: newEnd,
          extensionCount: (o.extensionCount || 0) + 1,
          credentialHistory: [archiveCred, ...(o.credentialHistory || [])],
          notes: `Extended on ${format(new Date(), 'MMM dd, yyyy')}. ${newCredentialData.note || ''}`,
        };
      })
    }));

    fetch(`${API_BASE}/orders/${orderId}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCredentialData),
    }).catch(e => console.warn('Sync error:', e));
  },

  // Add Product (Instant 0ms Optimistic UI)
  addProduct: (product) => {
    const state = get();
    const newProduct = {
      ...product,
      id: `p${state.products.length + 1}`,
    };
    set({ products: [...state.products, newProduct] });
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch(err => console.warn(err));
  },

  // Update Product (Instant 0ms Optimistic UI)
  updateProduct: (id, updatedFields) => {
    set((state) => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updatedFields } : p)
    }));
    fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch(err => console.warn(err));
  },

  // Delete Product (Instant 0ms Optimistic UI)
  deleteProduct: (id) => {
    set((state) => ({ products: state.products.filter(p => p.id !== id) }));
    fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' }).catch(err => console.warn(err));
  },

  // Add Customer (Instant 0ms Optimistic UI)
  addCustomer: (customer) => {
    const state = get();
    const newCustomer = {
      ...customer,
      id: `CUST-${1000 + state.customers.length + 1}`,
      totalOrders: 0,
      totalSpent: 0,
    };
    set({ customers: [...state.customers, newCustomer] });
    fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    }).catch(err => console.warn(err));
  },

  // Update Customer (Instant 0ms Optimistic UI)
  updateCustomer: (id, updatedFields) => {
    set((state) => ({
      customers: state.customers.map(c => c.id === id ? { ...c, ...updatedFields } : c)
    }));
    fetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    }).catch(err => console.warn(err));
  },

  // Delete Customer (Instant 0ms Optimistic UI)
  deleteCustomer: (id) => {
    set((state) => ({ customers: state.customers.filter(c => c.id !== id) }));
    fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' }).catch(err => console.warn(err));
  },

  // Delete Order (INSTANT 0ms Optimistic Delete)
  deleteOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    }));
    fetch(`${API_BASE}/orders/${orderId}`, { method: 'DELETE' })
      .catch(e => console.warn('Sync error:', e));
  },

  // Calculate Warranty Remaining Days (Ultra Fast Cached Integer Math)
  getRemainingWarrantyDays: (endDateStr) => {
    if (!endDateStr) return 0;
    if (dateCache.has(endDateStr)) return dateCache.get(endDateStr);

    try {
      const endMs = new Date(endDateStr).getTime();
      const diffDays = Math.ceil((endMs - todayMs) / (1000 * 60 * 60 * 24));
      const res = diffDays > 0 ? diffDays : 0;
      dateCache.set(endDateStr, res);
      return res;
    } catch {
      return 0;
    }
  },

  // Estimate Refund Amount Formula: (Remaining Days / Total Warranty Days) * (Selling Price - Discount)
  calculateRefundEstimate: (order) => {
    const remainingDays = get().getRemainingWarrantyDays(order.endDate);
    if (remainingDays <= 0 || !order.warrantyDays) return 0;
    const finalPaidPrice = (order.sellingPrice || 0) - (order.discount || 0);
    const ratio = remainingDays / order.warrantyDays;
    return Math.round(finalPaidPrice * ratio);
  },
}));
