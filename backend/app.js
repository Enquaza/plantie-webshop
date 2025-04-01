const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Route Const
const loginRoutes = require('./routes/login');
const productRoutes = require('./routes/products');

const app = express();
const db = require('./config/db');

// Middlewares
app.use(cors({
    origin: ['http://localhost:5500', 'http://192.168.0.80:5500'],
    credentials: true
}));
app.use(bodyParser.json());

// API Routes
app.use('/api/auth', loginRoutes);
app.use('/api/products', productRoutes);

// Test-Route
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend läuft sauber! 🎉" });
});

module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});

// Backend Server starten: npm run dev
// Frontend Server: im dir /frontend:  http-server -p 5500