const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin-Check
function isAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ error: "Not authorized." });
    }
    next();
}

// Alle Kunden abrufen
router.get('/customers', isAdmin, (req, res) => {
    const sql = `SELECT id, username, email, active FROM users WHERE isAdmin = 0`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error when loading customers:", err.message);
            return res.status(500).json({ error: "Server error." });
        }
        res.json(rows);
    });
});

// Kunden aktiv/deaktiv schalten
router.post('/customers/toggle', isAdmin, (req, res) => {
    const { customerId, active } = req.body;
    const sql = `UPDATE users SET active = ? WHERE id = ?`;
    db.run(sql, [active ? 1 : 0, customerId], function (err) {
        if (err) {
            console.error("Error when updating the customer status:", err.message);
            return res.status(500).json({ error: "Server error." });
        }
        res.json({ success: true });
    });
});

// Bestellungen eines Kunden abrufen
router.get('/customers/:customerId/orders', isAdmin, (req, res) => {
    const customerId = req.params.customerId;

    const sql = `
        SELECT orders.id AS orderId, products.name AS productName, products.id AS productId, order_items.quantity
        FROM orders
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id
        WHERE orders.user_id = ?
    `;

    db.all(sql, [customerId], (err, rows) => {
        if (err) {
            console.error("Error loading the orders:", err.message);
            return res.status(500).json({ error: "Server error." });
        }
        res.json(rows);
    });
});

// Produkt aus Bestellung entfernen
router.post('/customers/orders/remove', isAdmin, (req, res) => {
    const { orderId, productId } = req.body;

    const sql = `DELETE FROM order_items WHERE order_id = ? AND product_id = ?`;
    db.run(sql, [orderId, productId], function (err) {
        if (err) {
            console.error("Error when removing the product from the order:", err.message);
            return res.status(500).json({ error: "Server error." });
        }
        if (this.changes > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Product or order not found." });
        }
    });
});

module.exports = router;