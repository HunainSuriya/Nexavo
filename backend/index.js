const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Nexavo Backend is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/projects', (req, res) => {
  res.json({ 
    success: true, 
    projects: [
      { id: 1, title: "ERPNext Solutions", category: "ERPNext", description: "Complete business automation" },
      { id: 2, title: "Web Development", category: "Web Development", description: "Modern web applications" },
      { id: 3, title: "Desktop Applications", category: "Desktop App", description: "Cross-platform software" }
    ] 
  });
});

app.post('/api/enquiries', (req, res) => {
  console.log('Enquiry received:', req.body);
  res.json({ success: true, message: "Thank you! We will contact you soon." });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;