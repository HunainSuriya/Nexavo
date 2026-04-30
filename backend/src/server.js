const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const env = require('./config/env');
const Admin = require('./models/Admin');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const enquiryRoutes = require('./routes/enquiries');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Seed default admin
  await Admin.seedDefaultAdmin();
  
  app.listen(env.port, () => {
    console.log(`
    ═══════════════════════════════════════════════
    🚀 Nexavo Backend Server Running Successfully!
    ═══════════════════════════════════════════════
    📡 Port: ${env.port}
    🌍 Environment: ${env.nodeEnv}
    🔗 API URL: http://localhost:${env.port}/api
    💾 Database: SQLite
    📁 Uploads: ${uploadsDir}
    ═══════════════════════════════════════════════
    
    Admin Login:
    👤 Username: nexavo
    🔑 Password: Nexavo@2024
    
    API Endpoints:
    • POST /api/auth/login
    • GET  /api/projects
    • POST /api/projects (Admin)
    • POST /api/enquiries
    `);
  });
};

startServer();

module.exports = app;