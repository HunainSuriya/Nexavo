const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Nexavo Backend is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    projects: [
      {
        id: 1,
        title: "ERPNext Solutions",
        description: "Enterprise resource planning",
        category: "ERPNext",
        image_url: "/placeholder.jpg"
      }
    ]
  });
});

app.post('/api/enquiries', (req, res) => {
  console.log('Enquiry:', req.body);
  res.json({ success: true, message: 'Received' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});