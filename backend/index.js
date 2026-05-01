const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nexavo API is running!',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/projects', (req, res) => {
  res.json({ 
    success: true, 
    projects: [
      {
        id: 1,
        title: "ERPNext Solution",
        description: "Business automation",
        category: "ERPNext"
      }
    ] 
  });
});

app.post('/api/enquiries', (req, res) => {
  res.json({ success: true, message: "Enquiry received" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});