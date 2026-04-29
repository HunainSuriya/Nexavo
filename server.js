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
app.use(express.static('public')); // Your Nexavo files go here

// Get user's IP
const getIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

// ============= API ROUTES =============

// Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  const ip = getIp(req);
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `INSERT INTO messages (name, email, message, ip_address) VALUES (?, ?, ?, ?)`;
  
  db.run(query, [name, email, message, ip], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to save message' });
    }
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully!',
      id: this.lastID 
    });
  });
});

// Get all messages (admin only - you can add auth later)
app.get('/api/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Save user data (replaces localStorage)
app.post('/api/save-data', (req, res) => {
  const { user_id, data_key, data_value } = req.body;
  
  const query = `
    INSERT INTO user_data (user_id, data_key, data_value, updated_at) 
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, data_key) 
    DO UPDATE SET data_value = ?, updated_at = CURRENT_TIMESTAMP
  `;
  
  db.run(query, [user_id, data_key, data_value, data_value], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Get user data
app.get('/api/get-data/:user_id/:data_key', (req, res) => {
  const { user_id, data_key } = req.params;
  
  db.get(
    'SELECT data_value FROM user_data WHERE user_id = ? AND data_key = ?',
    [user_id, data_key],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row || { data_value: null });
    }
  );
});

// Track page visit (analytics)
app.post('/api/track-visit', (req, res) => {
  const { page, referrer } = req.body;
  const userAgent = req.headers['user-agent'];
  
  db.run(
    'INSERT INTO analytics (page, referrer, user_agent) VALUES (?, ?, ?)',
    [page, referrer, userAgent],
    (err) => {
      if (err) console.error('Analytics error:', err);
    }
  );
  res.json({ success: true });
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as total FROM messages', (err, row) => {
    stats.messages = row.total;
    
    db.get('SELECT COUNT(*) as unread FROM messages WHERE status = "unread"', (err, row) => {
      stats.unread = row.unread;
      
      db.get('SELECT COUNT(*) as visits FROM analytics', (err, row) => {
        stats.visits = row.total;
        res.json(stats);
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Nexavo server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
});