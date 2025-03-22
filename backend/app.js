// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const loginRoutes = require('./routes/login');

const app = express();

const db = require('./config/db');

// Middlewares
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(bodyParser.json());

// API Routes
app.use('/api/auth', loginRoutes);

// Test-Route
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend läuft sauber! 🎉" });
});

module.exports = app;
