const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get projects
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    projects: [
      {
        id: 1,
        title: "ERPNext Implementation",
        description: "Complete ERP solution for business automation",
        category: "ERPNext",
        image_url: "https://via.placeholder.com/400x300",
        live_url: "#"
      },
      {
        id: 2,
        title: "Modern E-commerce Website",
        description: "Full-stack e-commerce platform",
        category: "Web Development",
        image_url: "https://via.placeholder.com/400x300",
        live_url: "#"
      },
      {
        id: 3,
        title: "Desktop POS System",
        description: "Point of sale desktop application",
        category: "Desktop App",
        image_url: "https://via.placeholder.com/400x300",
        live_url: "#"
      }
    ]
  });
});

// Submit contact form
app.post('/api/enquiries', (req, res) => {
  const { client_name, email, project_type, message } = req.body;
  console.log('New enquiry:', { client_name, email, project_type, message });
  
  res.json({
    success: true,
    message: 'Thank you! We will contact you soon.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});