import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import pg from 'pg';

const pgPool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'erp_crossmart',
  password: process.env.DB_PASSWORD || 'merikolenndb',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10,
  idleTimeoutMillis: 30000,
});

function verifyWerkzeugHash(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('scrypt:')) return false;
  try {
    const parts = storedHash.split('$');
    if (parts.length < 3) return false;
    const params = parts[0].split(':');
    const N = parseInt(params[1]) || 32768;
    const r = parseInt(params[2]) || 8;
    const p = parseInt(params[3]) || 1;
    const salt = parts[1];
    const expected = parts[2];
    const derived = crypto.scryptSync(password, salt, expected.length / 2, { cost: N, blockSize: r, parallelization: p, maxmem: 128 * 1024 * 1024 });
    return derived.toString('hex') === expected;
  } catch (err) {
    console.error('[Password Verify Error]:', err.message);
    return false;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-Memory Database Cache for Instant 0.1ms Speeds
let cachedDb = { users: [], products: [], customers: [], households: [], suppliers: [], orders: [] };
let saveTimeout = null;

// Password Hashing Helper
function hashPassword(password) {
  const salt = crypto.randomBytes(8).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64, { cost: 32768, blockSize: 8, parallelization: 1, maxmem: 128 * 1024 * 1024 });
  return `scrypt:32768:8:1$${salt}$${derived.toString('hex')}`;
}

// Brevo Email Dispatch Helper
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

async function sendVerificationEmail(recipientEmail, recipientName, token, req) {
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const frontendHost = rawHost.includes(':4000') ? rawHost.replace(':4000', ':3000') : rawHost;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const verifyLink = `${protocol}://${frontendHost}/api/auth/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 24px; padding: 40px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
        .logo-box { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px; margin-bottom: 24px; color: #ffffff; font-weight: 800; font-size: 20px; letter-spacing: 1px; }
        h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(99,102,241,0.4); transition: transform 0.2s; }
        .warning-box { margin-top: 32px; padding: 12px 18px; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); border-radius: 12px; color: #fb7185; font-size: 13px; font-weight: 600; display: inline-block; }
        .footer { margin-top: 36px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-box">CROSSMART ERP</div>
        <h1>Verify Your Email Address</h1>
        <p>Hello <strong>${recipientName || recipientEmail}</strong>,<br>Thank you for signing up for CrossMart ERP. Please click the button below to complete your account verification.</p>
        <a href="${verifyLink}" target="_blank" class="btn">Verify My Email</a>
        <br>
        <div class="warning-box">⚡ Note: This verification link expires in 3 minutes.</div>
        <div class="footer">If you did not request this email, please ignore it.<br>&copy; 2026 CrossMart ERP System</div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'CrossMart ERP', email: 'erpcrossmart@gmail.com' },
      to: [{ email: recipientEmail, name: recipientName || recipientEmail }],
      subject: 'Verify your CrossMart ERP Account',
      htmlContent: htmlContent
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('[Brevo API Error]:', data);
    throw new Error(data.message || 'Failed to send verification email via Brevo');
  }
  return data;
}

// Initial RAM Hydration from File
async function initCache() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    cachedDb = JSON.parse(data);
    if (!cachedDb.users) cachedDb.users = [];
    console.log(`[Memory Cache] Hydrated ${cachedDb.users?.length || 0} users, ${cachedDb.orders?.length || 0} orders into RAM.`);
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
  res.json({ 
    status: 'ok', 
    message: 'CrossMart ERP PostgreSQL Backend', 
    version: '1.0.0',
    dbType: 'PostgreSQL',
    database: 'erp_crossmart',
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'production'
  });
});

// --- AUTHENTICATION & NATIVE REGISTRATION ---

// 1. REGISTER NEW USER & SEND BREVO EMAIL
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and Password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  // Ensure users array exists
  if (!cachedDb.users) cachedDb.users = [];

  // Check if email already exists
  const existingUserIndex = cachedDb.users.findIndex(u => u.email === normalizedEmail || u.username === normalizedEmail);
  
  if (existingUserIndex !== -1 && cachedDb.users[existingUserIndex].isVerified) {
    return res.status(400).json({ success: false, error: 'Email is already registered and verified. Please sign in.' });
  }

  // Generate 3-Minute Verification Token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes expiration

  const userRole = cachedDb.users.length === 0 ? 'admin' : 'admin';

  const userObj = {
    id: existingUserIndex !== -1 ? cachedDb.users[existingUserIndex].id : `usr_${Date.now()}`,
    name: name?.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    username: normalizedEmail,
    passwordHash: hashPassword(password),
    role: existingUserIndex !== -1 ? cachedDb.users[existingUserIndex].role : userRole,
    isVerified: false,
    verificationToken: token,
    verificationExpiresAt: expiresAt,
    createdAt: existingUserIndex !== -1 ? cachedDb.users[existingUserIndex].createdAt : new Date().toISOString()
  };

  if (existingUserIndex !== -1) {
    cachedDb.users[existingUserIndex] = userObj;
  } else {
    cachedDb.users.push(userObj);
  }

  try {
    await pgPool.query(`
      INSERT INTO users (id, name, email, username, password_hash, role, is_verified, verification_token, verification_expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        verification_token = EXCLUDED.verification_token,
        verification_expires_at = EXCLUDED.verification_expires_at,
        is_verified = EXCLUDED.is_verified;
    `, [userObj.id, userObj.name, userObj.email, userObj.username, userObj.passwordHash, userObj.role, false, token, expiresAt]);
  } catch (pgErr) {
    console.error('[PostgreSQL Register Insert Error]:', pgErr.message);
  }

  queueSave();

  try {
    await sendVerificationEmail(normalizedEmail, userObj.name, token, req);
    console.log(`[Brevo] Verification email sent to ${normalizedEmail}`);
    return res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox and click "Verify My Email".',
      email: normalizedEmail,
      expiresAt: expiresAt
    });
  } catch (err) {
    console.error('[Register Email Dispatch Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send verification email. Please try again.' });
  }
});

// 2. VERIFY EMAIL CLICK (HTML Response)
app.get('/api/auth/verify-email', (req, res) => {
  const { token } = req.query;
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const frontendHost = rawHost.includes(':4000') ? rawHost.replace(':4000', ':3000') : rawHost;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const frontendUrl = `${protocol}://${frontendHost}`;

  if (!token || !cachedDb.users) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Invalid Link</title></head>
      <body style="font-family:sans-serif;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="background:#18181b;border:1px solid #27272a;padding:40px;border-radius:24px;text-align:center;">
          <h1 style="color:#ef4444;">Invalid Verification Link</h1>
          <p style="color:#a1a1aa;">The verification link is invalid or has already been used.</p>
          <a href="${frontendUrl}" style="display:inline-block;margin-top:16px;background:#6366f1;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:bold;">Return to Dashboard</a>
        </div>
      </body></html>
    `);
  }

  const user = cachedDb.users.find(u => u.verificationToken === token);

  if (!user) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Token Not Found</title></head>
      <body style="font-family:sans-serif;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="background:#18181b;border:1px solid #27272a;padding:40px;border-radius:24px;text-align:center;">
          <h1 style="color:#ef4444;">Link Expired or Not Found</h1>
          <p style="color:#a1a1aa;">This verification link is no longer valid. Please register or resend email.</p>
          <a href="${frontendUrl}" style="display:inline-block;margin-top:16px;background:#6366f1;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:bold;">Return to Dashboard</a>
        </div>
      </body></html>
    `);
  }

  if (Date.now() > user.verificationExpiresAt) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Link Expired</title></head>
      <body style="font-family:sans-serif;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="background:#18181b;border:1px solid #27272a;padding:40px;border-radius:24px;text-align:center;max-width:440px;">
          <h1 style="color:#f59e0b;">⏰ Verification Link Expired</h1>
          <p style="color:#a1a1aa;">Verification links expire after 3 minutes for security.<br>Please return to CrossMart ERP and click "Resend Email".</p>
          <a href="${frontendUrl}" style="display:inline-block;margin-top:16px;background:#6366f1;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:bold;">Return to Dashboard</a>
        </div>
      </body></html>
    `);
  }

  // Mark verified
  user.isVerified = true;
  delete user.verificationToken;
  delete user.verificationExpiresAt;
  queueSave();

  console.log(`[Auth Verified] Account ${user.email} successfully verified!`);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="refresh" content="3;url=${frontendUrl}">
      <title>Email Verified | CrossMart ERP</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #09090b; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #18181b; border: 1px solid #27272a; padding: 48px; border-radius: 24px; text-align: center; max-width: 460px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .icon { font-size: 56px; margin-bottom: 16px; }
        h1 { font-size: 24px; margin-bottom: 12px; color: #4ade80; font-weight: 800; }
        p { color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 16px; font-weight: 800; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(99,102,241,0.4); }
        .redirect-notice { font-size: 12px; color: #64748b; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✅</div>
        <h1>Email Verified Successfully!</h1>
        <p>Your CrossMart ERP account <strong>${user.email}</strong> is now verified.<br>Redirecting you to the dashboard...</p>
        <a href="${frontendUrl}" class="btn">Go to Dashboard Now</a>
        <div class="redirect-notice">Automatically redirecting in 3 seconds...</div>
      </div>
    </body>
    </html>
  `);
});

// 3. CHECK VERIFICATION STATUS POLLING
app.get('/api/auth/check-verification-status', (req, res) => {
  const { email } = req.query;
  if (!email || !cachedDb.users) {
    return res.status(400).json({ success: false, error: 'Email parameter required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = cachedDb.users.find(u => u.email === normalizedEmail || u.username === normalizedEmail);

  if (!user) {
    return res.json({ success: true, isVerified: false, expired: false, found: false });
  }

  if (user.isVerified) {
    return res.json({
      success: true,
      isVerified: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }

  const isExpired = user.verificationExpiresAt ? Date.now() > user.verificationExpiresAt : false;
  return res.json({ success: true, isVerified: false, expired: isExpired, found: true });
});

// 4. RESEND VERIFICATION EMAIL
app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email || !cachedDb.users) {
    return res.status(400).json({ success: false, error: 'Email required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = cachedDb.users.find(u => u.email === normalizedEmail || u.username === normalizedEmail);

  if (!user) {
    return res.status(404).json({ success: false, error: 'Account not found. Please register.' });
  }

  if (user.isVerified) {
    return res.json({ success: true, isVerified: true, message: 'Account is already verified. Please sign in.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 3 * 60 * 1000;

  user.verificationToken = token;
  user.verificationExpiresAt = expiresAt;
  queueSave();

  try {
    await sendVerificationEmail(normalizedEmail, user.name, token, req);
    return res.json({
      success: true,
      message: 'New verification email sent. Please check your inbox.',
      expiresAt: expiresAt
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to resend verification email.' });
  }
});

// 5. UNIFIED LOGIN (Checks Native ERP Accounts First, then TeleShop fallback)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username/Email and Password are required' });
  }

  const normalizedInput = username.trim().toLowerCase();

  // 1. Check PostgreSQL erp_crossmart Database
  try {
    const pgRes = await pgPool.query(
      `SELECT id, name, email, username, password_hash, role, is_verified FROM users WHERE email = $1 OR username = $1 LIMIT 1`,
      [normalizedInput]
    );

    if (pgRes.rows.length > 0) {
      const u = pgRes.rows[0];
      const isPasswordValid = verifyWerkzeugHash(password, u.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      if (!u.is_verified) {
        return res.status(401).json({
          success: false,
          error: 'Please verify your email address before logging in.',
          requiresVerification: true,
          email: u.email
        });
      }

      return res.json({
        success: true,
        token: `cm_token_pg_${u.id}_${Date.now()}`,
        user: {
          id: u.id,
          name: u.name || u.email,
          username: u.email,
          email: u.email,
          role: u.role || 'admin',
          isSuperAdmin: u.role === 'superadmin',
          permissions: ['all']
        }
      });
    }
  } catch (err) {
    console.error('[PostgreSQL Auth Query Error]:', err.message);
  }

  // 2. Fallback to cachedDb users
  if (cachedDb.users && cachedDb.users.length > 0) {
    const nativeUser = cachedDb.users.find(u => u.email === normalizedInput || u.username === normalizedInput);
    if (nativeUser) {
      const isPasswordValid = verifyWerkzeugHash(password, nativeUser.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      if (!nativeUser.isVerified) {
        return res.status(401).json({
          success: false,
          error: 'Please verify your email address before logging in.',
          requiresVerification: true,
          email: nativeUser.email
        });
      }

      return res.json({
        success: true,
        token: `cm_token_native_${nativeUser.id}_${Date.now()}`,
        user: {
          id: nativeUser.id,
          name: nativeUser.name,
          username: nativeUser.email,
          email: nativeUser.email,
          role: nativeUser.role || 'admin',
          isSuperAdmin: nativeUser.role === 'superadmin',
          permissions: ['all']
        }
      });
    }
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// TeleShop Database Sync Endpoint
app.get('/api/sync/teleshop', async (req, res) => {
  const botId = parseInt(req.query.bot_id || '5');
  res.json({
    success: true,
    shop_bot_id: botId,
    total_orders_found: 0,
    orders: []
  });
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

// --- SUPERADMIN ENDPOINTS ---

// Helper: Extract user ID from token
function extractUserIdFromToken(token) {
  if (!token) return null;
  // Token format: cm_token_pg_<id>_<timestamp> or cm_token_native_<id>_<timestamp>
  const match = token.match(/cm_token_(?:pg|native)_(.+?)_\d+$/);
  return match ? match[1] : null;
}

// Helper: Verify superadmin role
async function verifySuperAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  const userId = extractUserIdFromToken(token);
  if (!userId) return false;

  try {
    const pgRes = await pgPool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (pgRes.rows.length > 0 && pgRes.rows[0].role === 'superadmin') return true;
  } catch (err) {
    console.error('[SuperAdmin Check PG Error]:', err.message);
  }

  // Fallback to cached
  const cachedUser = (cachedDb.users || []).find(u => u.id === userId);
  return cachedUser?.role === 'superadmin';
}

// GET all users (superadmin only)
app.get('/api/admin/users', async (req, res) => {
  if (!(await verifySuperAdmin(req))) {
    return res.status(403).json({ success: false, error: 'Superadmin access required' });
  }

  try {
    const pgRes = await pgPool.query('SELECT id, name, email, role, is_verified, verification_expires_at FROM users ORDER BY role DESC, email ASC');
    return res.json({ success: true, users: pgRes.rows });
  } catch (err) {
    console.error('[Admin Users PG Error]:', err.message);
    // Fallback to cached
    const users = (cachedDb.users || []).map(u => ({
      id: u.id, name: u.name, email: u.email, role: u.role, is_verified: u.isVerified
    }));
    return res.json({ success: true, users });
  }
});

// DELETE a user (superadmin only)
app.delete('/api/admin/users/:id', async (req, res) => {
  if (!(await verifySuperAdmin(req))) {
    return res.status(403).json({ success: false, error: 'Superadmin access required' });
  }

  const { id } = req.params;

  // Prevent deleting self
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const requesterId = extractUserIdFromToken(token);
  if (id === requesterId) {
    return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
  }

  try {
    await pgPool.query('DELETE FROM users WHERE id = $1', [id]);
  } catch (err) {
    console.error('[Admin Delete User PG Error]:', err.message);
  }

  cachedDb.users = (cachedDb.users || []).filter(u => u.id !== id);
  queueSave();
  res.json({ success: true, id });
});

// PUT change user role (superadmin only)
app.put('/api/admin/users/:id/role', async (req, res) => {
  if (!(await verifySuperAdmin(req))) {
    return res.status(403).json({ success: false, error: 'Superadmin access required' });
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'superadmin', 'staff'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role. Must be admin, superadmin, or staff.' });
  }

  try {
    await pgPool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
  } catch (err) {
    console.error('[Admin Role Update PG Error]:', err.message);
  }

  const cachedUser = (cachedDb.users || []).find(u => u.id === id);
  if (cachedUser) {
    cachedUser.role = role;
    queueSave();
  }

  res.json({ success: true, id, role });
});

// GET system-wide stats (superadmin only)
app.get('/api/admin/stats', async (req, res) => {
  if (!(await verifySuperAdmin(req))) {
    return res.status(403).json({ success: false, error: 'Superadmin access required' });
  }

  let userCount = 0;
  try {
    const pgRes = await pgPool.query('SELECT count(*) as count FROM users');
    userCount = parseInt(pgRes.rows[0].count);
  } catch (err) {
    userCount = (cachedDb.users || []).length;
  }

  const totalOrders = (cachedDb.orders || []).length;
  const totalProducts = (cachedDb.products || []).length;
  const totalCustomers = (cachedDb.customers || []).length;
  const totalHouseholds = (cachedDb.households || []).length;
  const totalSuppliers = (cachedDb.suppliers || []).length;
  const totalRevenue = (cachedDb.orders || []).reduce((sum, o) => sum + (o.sellingPrice || 0) - (o.discount || 0), 0);
  const totalProfit = (cachedDb.orders || []).reduce((sum, o) => sum + (o.netProfit || 0), 0);

  res.json({
    success: true,
    stats: {
      users: userCount,
      orders: totalOrders,
      products: totalProducts,
      customers: totalCustomers,
      households: totalHouseholds,
      suppliers: totalSuppliers,
      revenue: totalRevenue,
      profit: totalProfit
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Digital City ERP RAM Backend] Running ultra-fast on http://0.0.0.0:${PORT}`);
});
