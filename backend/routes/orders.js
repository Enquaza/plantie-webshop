const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const sql = `SELECT id, created_at, payment_method FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
    db.all(sql, [req.session.user.id], (err, rows) => {
        if (err) {
            console.error("Error when retrieving orders:", err.message);
            return res.status(500).json({ error: "Server error" });
        }
        res.json(rows);
    });
});

router.get('/invoice/:orderId', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Not logged in");
    }

    const orderId = req.params.orderId;

    const sqlOrder = `SELECT * FROM orders WHERE id = ? AND user_id = ?`;
    db.get(sqlOrder, [orderId, req.session.user.id], (err, order) => {
        if (err || !order) {
            return res.status(404).send("Order not found");
        }

        const sqlItems = `
            SELECT products.name, products.price, order_items.quantity
            FROM order_items
            JOIN products ON order_items.product_id = products.id
            WHERE order_items.order_id = ?
        `;
        db.all(sqlItems, [orderId], (err, items) => {
            if (err) {
                return res.status(500).send("Error when loading the order items");
            }

            // Rechnungsnummer generieren
            const invoiceNumber = "PL-" + order.id.toString().padStart(5, '0');
            const date = new Date(order.created_at).toLocaleDateString();

            // Rechnung HTML
            let html = `
                <h1>Rechnung ${invoiceNumber}</h1>
                <p>Datum: ${date}</p>
                <p>An: ${req.session.user.username}</p>
                <hr>
                <table border="1" cellspacing="0" cellpadding="5">
                    <tr><th>Produkt</th><th>Menge</th><th>Preis</th><th>Summe</th></tr>
            `;

            let total = 0;

            items.forEach(item => {
                const sum = item.quantity * item.price;
                total += sum;
                html += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price.toFixed(2)} €</td><td>${sum.toFixed(2)} €</td></tr>`;
            });

            html += `
                </table>
                <h3>Gesamt: ${total.toFixed(2)} €</h3>
            `;

            res.send(html);
        });
    });
});

module.exports = router;