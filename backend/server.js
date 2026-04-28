const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Campus Lab Slot Booking API',
    version: '1.0.0',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});