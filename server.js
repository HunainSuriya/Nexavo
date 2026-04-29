const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to run queries with Turso
async function runQuery(sql, params = []) {
  try {
    const result = await db.execute({ sql, args: params });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Helper to get single row
async function getQuery(sql, params = []) {
  try {
    const result = await db.execute({ sql, args: params });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Helper to get all rows
async function allQuery(sql, params = []) {
  try {
    const result = await db.execute({ sql, args: params });
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Get user's IP
const getIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

// ============= AUTHENTICATION ROUTES =============

// Register new user
app.post('/api/register', async (req, res) => {
  console.log('📝 Register request received:', req.body);
  
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Simple password hashing
  const simpleHash = Buffer.from(password).toString('base64');
  
  try {
    const result = await runQuery(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, simpleHash]
    );
    
    console.log('✅ User registered successfully! ID:', result.lastInsertRowid);
    res.json({ 
      success: true, 
      message: 'Registration successful! Please login.' 
    });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  console.log('🔐 Login request received for:', req.body.username);
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  const simpleHash = Buffer.from(password).toString('base64');
  
  try {
    const user = await getQuery(
      'SELECT id, username, email FROM users WHERE username = ? AND password = ?',
      [username, simpleHash]
    );
    
    if (user) {
      console.log('✅ User logged in:', user.username);
      res.json({ 
        success: true, 
        user: user,
        message: 'Login successful!' 
      });
    } else {
      console.log('❌ Invalid login attempt for:', username);
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify user session
app.post('/api/verify', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  try {
    const user = await getQuery(
      'SELECT id, username, email FROM users WHERE id = ?',
      [userId]
    );
    
    if (user) {
      res.json({ success: true, user: user });
    } else {
      res.status(401).json({ error: 'Invalid session' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ============= DATA ROUTES =============

// Submit contact form
app.post('/api/contact', async (req, res) => {
  console.log('📧 Contact form received from:', req.body.name);
  
  const { name, email, message, userId } = req.body;
  const ip = getIp(req);
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    const result = await runQuery(
      'INSERT INTO messages (user_id, name, email, message, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId || null, name, email, message, ip]
    );
    
    console.log('✅ Message saved with ID:', result.lastInsertRowid);
    res.json({ 
      success: true, 
      message: 'Message sent successfully!'
    });
  } catch (err) {
    console.error('Save message error:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Save user data (synced across devices)
app.post('/api/save-data', async (req, res) => {
  const { user_id, data_key, data_value } = req.body;
  
  if (!user_id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  try {
    // Check if exists
    const existing = await getQuery(
      'SELECT id FROM user_data WHERE user_id = ? AND data_key = ?',
      [user_id, data_key]
    );
    
    if (existing) {
      await runQuery(
        'UPDATE user_data SET data_value = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND data_key = ?',
        [data_value, user_id, data_key]
      );
    } else {
      await runQuery(
        'INSERT INTO user_data (user_id, data_key, data_value) VALUES (?, ?, ?)',
        [user_id, data_key, data_value]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Save data error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user data
app.get('/api/get-data/:user_id/:data_key', async (req, res) => {
  const { user_id, data_key } = req.params;
  
  try {
    const result = await getQuery(
      'SELECT data_value FROM user_data WHERE user_id = ? AND data_key = ?',
      [user_id, data_key]
    );
    
    res.json(result || { data_value: null });
  } catch (err) {
    console.error('Get data error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get ALL user data
app.get('/api/get-all-data/:user_id', async (req, res) => {
  const { user_id } = req.params;
  
  try {
    const rows = await allQuery(
      'SELECT data_key, data_value FROM user_data WHERE user_id = ?',
      [user_id]
    );
    
    const data = {};
    rows.forEach(row => {
      data[row.data_key] = row.data_value;
    });
    res.json(data);
  } catch (err) {
    console.error('Get all data error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Track page visit
app.post('/api/track-visit', async (req, res) => {
  const { page, referrer, userId } = req.body;
  const userAgent = req.headers['user-agent'];
  
  try {
    await runQuery(
      'INSERT INTO analytics (user_id, page, referrer, user_agent) VALUES (?, ?, ?, ?)',
      [userId || null, page, referrer, userAgent]
    );
  } catch (err) {
    console.error('Analytics error:', err);
  }
  res.json({ success: true });
});

// Get messages for user
app.get('/api/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const messages = await allQuery(
      'SELECT * FROM messages WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
app.get('/api/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const totalResult = await getQuery(
      'SELECT COUNT(*) as total FROM messages WHERE user_id = ? OR user_id IS NULL',
      [userId]
    );
    
    const unreadResult = await getQuery(
      'SELECT COUNT(*) as unread FROM messages WHERE (user_id = ? OR user_id IS NULL) AND status = "unread"',
      [userId]
    );
    
    const visitsResult = await getQuery(
      'SELECT COUNT(*) as visits FROM analytics WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      messages: totalResult?.total || 0,
      unread: unreadResult?.unread || 0,
      visits: visitsResult?.visits || 0
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Nexavo server running at http://localhost:${PORT}`);
  console.log(`💾 Using Turso cloud database`);
  console.log(`📝 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🔐 Login page: http://localhost:${PORT}/login.html\n`);
});