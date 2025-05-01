// Packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Route Const
const loginRoutes = require('./routes/login');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const adminCustomerRoutes = require('./routes/admin-customers');

const app = express();
const db = require('./config/db');

// Middlewares nicht mehr nötig
/*app.use(cors({
    origin: ['http://localhost:5500', 'http://192.168.0.80:5500'],
    credentials: true
}));*/
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
    secret: 'plantie-supergeheim', // 🔐 geheim halten
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: null,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// aufgrund von port problemen geändert
app.use(express.static('frontend'));

// API Routes
app.use('/api/auth', loginRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminCustomerRoutes);

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
//
// Backend Server stoppen:
// netstat -ano | findstr :3000
// taskkill /PID 12345 /F