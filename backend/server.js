import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-Memory Database Cache for Instant 0.1ms Speeds
let cachedDb = { products: [], customers: [], households: [], suppliers: [], orders: [] };
let saveTimeout = null;

// Initial RAM Hydration from File
async function initCache() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    cachedDb = JSON.parse(data);
    console.log(`[Memory Cache] Hydrated ${cachedDb.orders?.length || 0} orders, ${cachedDb.products?.length || 0} products into RAM.`);
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
}
initCache();

// Asynchronous Non-blocking Debounced Save to Disk
function queueSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(cachedDb, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error background writing db.json:', err);
    }
  }, 200); // 200ms debounce
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Digital City ERP High-Performance RAM Database Backend', version: '2.0.0' });
});

// GET all data in one payload for instant store hydration
app.get('/api/all', (req, res) => {
  res.json(cachedDb);
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  res.json(cachedDb.orders || []);
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder.id) {
    newOrder.id = `ORD-2026-${String((cachedDb.orders?.length || 0) + 804).padStart(4, '0')}`;
  }
  if (!newOrder.receiptId) {
    newOrder.receiptId = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  cachedDb.orders = [newOrder, ...(cachedDb.orders || [])];
  queueSave();
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = cachedDb.orders.findIndex((o) => o.id === id);
  if (index !== -1) {
    cachedDb.orders[index] = { ...cachedDb.orders[index], ...req.body };
    queueSave();
    return res.json(cachedDb.orders[index]);
  }
  res.status(404).json({ error: 'Order not found' });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  cachedDb.orders = (cachedDb.orders || []).filter((o) => o.id !== id);
  queueSave();
  res.json({ success: true, id });
});

// Order Extension
app.post('/api/orders/:id/extend', (req, res) => {
  const { id } = req.params;
  const { accountEmail, accountPassword, activationUrl, note, extensionDays = 30 } = req.body;
  const order = cachedDb.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const archiveCred = {
    date: new Date().toISOString(),
    deliveryMethod: order.deliveryMethod,
    accountEmail: order.accountEmail,
    accountPassword: order.accountPassword,
    activationUrl: order.activationUrl,
  };

  const currentEnd = new Date(order.endDate || Date.now());
  currentEnd.setDate(currentEnd.getDate() + Number(extensionDays));
  const newEndStr = currentEnd.toISOString().split('T')[0];

  order.accountEmail = accountEmail || order.accountEmail;
  order.accountPassword = accountPassword || order.accountPassword;
  order.activationUrl = activationUrl || order.activationUrl;
  order.endDate = newEndStr;
  order.extensionCount = (order.extensionCount || 0) + 1;
  order.credentialHistory = [archiveCred, ...(order.credentialHistory || [])];
  order.notes = `Extended on ${new Date().toLocaleDateString()}. ${note || ''}`;

  queueSave();
  res.json(order);
});

// Toggle Reminded (Instant Response)
app.put('/api/orders/:id/toggle-reminded', (req, res) => {
  const { id } = req.params;
  const order = cachedDb.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.isReminded = !order.isReminded;
  queueSave();
  res.json(order);
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  res.json(cachedDb.products || []);
});

app.post('/api/products', (req, res) => {
  const product = { ...req.body, id: req.body.id || `p${(cachedDb.products?.length || 0) + 1}` };
  cachedDb.products = [...(cachedDb.products || []), product];
  queueSave();
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const idx = (cachedDb.products || []).findIndex(p => p.id === id);
  if (idx !== -1) {
    cachedDb.products[idx] = { ...cachedDb.products[idx], ...req.body };
    queueSave();
    return res.json(cachedDb.products[idx]);
  }
  res.status(404).json({ error: 'Product not found' });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  cachedDb.products = (cachedDb.products || []).filter(p => p.id !== id);
  queueSave();
  res.json({ success: true, id });
});

// --- CUSTOMERS ---
app.get('/api/customers', (req, res) => {
  res.json(cachedDb.customers || []);
});

app.post('/api/customers', (req, res) => {
  const customer = {
    ...req.body,
    id: req.body.id || `CUST-${1000 + (cachedDb.customers?.length || 0) + 1}`,
    totalOrders: req.body.totalOrders || 0,
    totalSpent: req.body.totalSpent || 0,
  };
  cachedDb.customers = [...(cachedDb.customers || []), customer];
  queueSave();
  res.status(201).json(customer);
});

app.put('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const idx = (cachedDb.customers || []).findIndex(c => c.id === id);
  if (idx !== -1) {
    cachedDb.customers[idx] = { ...cachedDb.customers[idx], ...req.body };
    queueSave();
    return res.json(cachedDb.customers[idx]);
  }
  res.status(404).json({ error: 'Customer not found' });
});

app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  cachedDb.customers = (cachedDb.customers || []).filter(c => c.id !== id);
  queueSave();
  res.json({ success: true, id });
});

// --- HOUSEHOLDS ---
app.get('/api/households', (req, res) => {
  res.json(cachedDb.households || []);
});

app.post('/api/households', (req, res) => {
  const household = { ...req.body, id: req.body.id || `h${(cachedDb.households?.length || 0) + 1}` };
  cachedDb.households = [...(cachedDb.households || []), household];
  queueSave();
  res.status(201).json(household);
});

app.put('/api/households/:id', (req, res) => {
  const { id } = req.params;
  const idx = (cachedDb.households || []).findIndex(h => h.id === id);
  if (idx !== -1) {
    cachedDb.households[idx] = { ...cachedDb.households[idx], ...req.body };
    queueSave();
    return res.json(cachedDb.households[idx]);
  }
  res.status(404).json({ error: 'Household not found' });
});

app.delete('/api/households/:id', (req, res) => {
  const { id } = req.params;
  cachedDb.households = (cachedDb.households || []).filter(h => h.id !== id);
  queueSave();
  res.json({ success: true, id });
});

// --- SUPPLIERS ---
app.get('/api/suppliers', (req, res) => {
  res.json(cachedDb.suppliers || []);
});

app.post('/api/suppliers', (req, res) => {
  const supplier = { ...req.body, id: req.body.id || `s${(cachedDb.suppliers?.length || 0) + 1}` };
  cachedDb.suppliers = [...(cachedDb.suppliers || []), supplier];
  queueSave();
  res.status(201).json(supplier);
});

app.put('/api/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const idx = (cachedDb.suppliers || []).findIndex(s => s.id === id);
  if (idx !== -1) {
    cachedDb.suppliers[idx] = { ...cachedDb.suppliers[idx], ...req.body };
    queueSave();
    return res.json(cachedDb.suppliers[idx]);
  }
  res.status(404).json({ error: 'Supplier not found' });
});

app.delete('/api/suppliers/:id', (req, res) => {
  const { id } = req.params;
  cachedDb.suppliers = (cachedDb.suppliers || []).filter(s => s.id !== id);
  queueSave();
  res.json({ success: true, id });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Digital City ERP RAM Backend] Running ultra-fast on http://0.0.0.0:${PORT}`);
});
