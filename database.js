const { createClient } = require('@libsql/client');

// PASTE YOUR TURSO AUTH TOKEN HERE (from Turso dashboard)
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc0NzA1NTAsImlkIjoiMDE5ZGQ5NmItMWEwMS03YjMxLWEyNDgtMzdlNTNjMmVhYzY3IiwicmlkIjoiOTAwYzg3YTgtYzk0ZS00MWUyLWFhZGYtNjI5NWZkYWU4ODhhIn0.m6KLdu2bgvvabx1FYneUdHkoPz5lAUlBUJGYU6FkkgA1Luixze8mWEaKxgmGzZY3mQ5GpbpN9H5YStN_ezRUBw';

// Create Turso client
const db = createClient({
  url: 'libsql://nexavodb-hunainsuriya.aws-ap-south-1.turso.io',
  authToken: TURSO_AUTH_TOKEN,
});

// Test connection
(async () => {
  try {
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Turso database connected successfully!');
  } catch (error) {
    console.error('❌ Turso connection failed:', error.message);
  }
})();

// Create tables function
async function initializeDatabase() {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // User data table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        data_key TEXT NOT NULL,
        data_value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, data_key),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Analytics table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        page TEXT,
        referrer TEXT,
        user_agent TEXT,
        visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All Turso database tables ready!');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize
initializeDatabase();

module.exports = db;