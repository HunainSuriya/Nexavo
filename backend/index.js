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
  res.json({ status: 'OK' });
});

app.get('/api/projects', (req, res) => {
  res.json({ 
    success: true, 
    projects: [
      { id: 1, title: "ERPNext Solutions", category: "ERPNext" },
      { id: 2, title: "Web Development", category: "Web Development" }
    ] 
  });
});

app.post('/api/enquiries', (req, res) => {
  res.json({ success: true, message: "Message received!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;