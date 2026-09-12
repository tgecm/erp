import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const pgPool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'telegram_market',
  password: process.env.DB_PASSWORD || 'merikolenndb',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 5,
  idleTimeoutMillis: 30000,
});

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
  res.json({ status: 'ok', message: 'CrossMart ERP High-Performance RAM Database Backend', version: '1.0.0' });
});

// --- AUTHENTICATION & SHARED LOGIN ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username/Email and Password are required' });
  }

  // 1. Check Presets / Local Fallback Accounts
  if (username === 'merikolenn@gmail.com' || username === 'owner') {
    if (password === 'admin123' || password === 'pass#12345') {
      return res.json({
        success: true,
        token: `cm_token_owner_${Date.now()}`,
        user: {
          id: 1,
          name: 'Maung Lenn',
          username: 'merikolenn@gmail.com',
          email: 'merikolenn@gmail.com',
          role: 'Project Owner',
          permissions: ['all']
        }
      });
    }
  }

  if (username === 'admin') {
    if (password === 'admin123' || password === 'pass#12345') {
      return res.json({
        success: true,
        token: `cm_token_admin_${Date.now()}`,
        user: {
          id: 2,
          name: 'Shop Admin',
          username: 'admin',
          email: 'admin@crossmarterp.com',
          role: 'Admin',
          permissions: ['manage_shop', 'sales', 'reports']
        }
      });
    }
  }

  if (username === 'cashier1' || username === 'staff') {
    if (password === 'cashier123' || password === '1234' || password === 'pass#12345') {
      return res.json({
        success: true,
        token: `cm_token_staff_${Date.now()}`,
        user: {
          id: 3,
          name: 'Cashier Staff',
          username: 'cashier1',
          role: 'Staff',
          permissions: ['cashier', 'slips']
        }
      });
    }
  }

  // 2. Query Read-Only PostgreSQL Database (`telegram_market`) for Shared Logins
  try {
    const staffResult = await pgPool.query(
      `SELECT id, username, name, role, is_active FROM staff_accounts WHERE (username = $1 OR name = $1) AND is_active = TRUE LIMIT 1`,
      [username]
    );

    if (staffResult.rows.length > 0) {
      const staff = staffResult.rows[0];
      const assignedRole = staff.role === 'admin' ? 'Admin' : staff.role === 'moderator' ? 'Moderator' : 'Staff';
      return res.json({
        success: true,
        token: `cm_token_pg_${staff.id}_${Date.now()}`,
        user: {
          id: staff.id,
          name: staff.name || staff.username,
          username: staff.username,
          role: assignedRole,
          permissions: ['cashier', 'slips', 'records']
        }
      });
    }

    const userResult = await pgPool.query(
      `SELECT id, username, email, web_panel_email, first_name, is_admin FROM users WHERE (web_panel_email = $1 OR email = $1 OR username = $1) LIMIT 1`,
      [username]
    );

    if (userResult.rows.length > 0) {
      const u = userResult.rows[0];
      const isOwner = u.email === 'merikolenn@gmail.com' || u.web_panel_email === 'merikolenn@gmail.com';
      const assignedRole = isOwner ? 'Project Owner' : u.is_admin ? 'Admin' : 'Moderator';
      return res.json({
        success: true,
        token: `cm_token_user_${u.id}_${Date.now()}`,
        user: {
          id: u.id,
          name: u.first_name || u.username || u.web_panel_email,
          username: u.web_panel_email || u.username || u.email,
          email: u.web_panel_email || u.email,
          role: assignedRole,
          permissions: ['all']
        }
      });
    }

    return res.status(401).json({ success: false, error: 'Invalid username or password' });

  } catch (err) {
    console.error('[Shared Login Query Error]:', err.message);
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
});

// Read-Only TeleShop Database Sync Endpoint
app.get('/api/sync/teleshop', async (req, res) => {
  const botId = parseInt(req.query.bot_id || '5');
  try {
    const result = await pgPool.query(
      `SELECT id, order_number, receipt_no, total_amount, discount_amount, payment_method, buyer_snapshot, items, status, created_at 
       FROM orders 
       WHERE bot_id = $1 
       ORDER BY id DESC LIMIT 50`,
      [botId]
    );

    res.json({
      success: true,
      shop_bot_id: botId,
      total_orders_found: result.rows.length,
      orders: result.rows
    });
  } catch (err) {
    console.error('[TeleShop Read-Only Sync Error]:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
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
