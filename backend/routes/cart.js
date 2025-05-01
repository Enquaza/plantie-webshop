const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Produkt zum Warenkorb hinzufügen
router.post('/add', (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.status(401).json({ error: "Bitte zuerst einloggen!" });
    }

    // 1. Hat der User schon einen Warenkorb?
    const findCartSql = `SELECT id FROM carts WHERE user_id = ?`;
    db.get(findCartSql, [userId], (err, cartRow) => {
        if (err) {
            console.error("Fehler beim Suchen des Warenkorbs:", err.message);
            return res.status(500).json({ error: "Serverfehler." });
        }

        const cartId = cartRow ? cartRow.id : null;

        function addItemToCart(cartId) {
            // Prüfen ob Produkt schon im Warenkorb
            const checkItemSql = `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`;
            db.get(checkItemSql, [cartId, productId], (err, itemRow) => {
                if (err) {
                    console.error("Fehler beim Prüfen des Artikels:", err.message);
                    return res.status(500).json({ error: "Serverfehler." });
                }

                if (itemRow) {
                    // Menge erhöhen
                    const updateSql = `UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?`;
                    db.run(updateSql, [itemRow.id], function (err) {
                        if (err) {
                            console.error("Fehler beim Erhöhen der Menge:", err.message);
                            return res.status(500).json({ error: "Serverfehler." });
                        }
                        res.json({ success: true });
                    });
                } else {
                    // Neues Produkt einfügen
                    const insertSql = `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)`;
                    db.run(insertSql, [cartId, productId], function (err) {
                        if (err) {
                            console.error("Fehler beim Einfügen des Produkts:", err.message);
                            return res.status(500).json({ error: "Serverfehler." });
                        }
                        res.json({ success: true });
                    });
                }
            });
        }

        if (cartId) {
            addItemToCart(cartId);
        } else {
            // Neuen Warenkorb erstellen
            const createCartSql = `INSERT INTO carts (user_id) VALUES (?)`;
            db.run(createCartSql, [userId], function (err) {
                if (err) {
                    console.error("Fehler beim Erstellen des Warenkorbs:", err.message);
                    return res.status(500).json({ error: "Serverfehler." });
                }
                addItemToCart(this.lastID);
            });
        }
    });
});

// Produkt aus dem Warenkorb entfernen

router.post('/remove', (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.status(401).json({ error: "Bitte zuerst einloggen!" });
    }

    // Schritt 1: Den Warenkorb des Users finden
    const findCartSql = `SELECT id FROM carts WHERE user_id = ?`;
    db.get(findCartSql, [userId], (err, cartRow) => {
        if (err) {
            console.error("Fehler beim Suchen des Warenkorbs:", err.message);
            return res.status(500).json({ error: "Serverfehler." });
        }

        if (!cartRow) {
            return res.status(400).json({ error: "Kein Warenkorb gefunden." });
        }

        const cartId = cartRow.id;

        // Schritt 2: Das Produkt aus dem Warenkorb entfernen
        const deleteSql = `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`;
        db.run(deleteSql, [cartId, productId], function (err) {
            if (err) {
                console.error("Fehler beim Entfernen des Produkts:", err.message);
                return res.status(500).json({ error: "Serverfehler." });
            }

            if (this.changes > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: "Produkt nicht im Warenkorb gefunden." });
            }
        });
    });
});

// Warenkorb abrufen
router.get('/', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.json([]);  // Gast-User → leerer Warenkorb
    }

    const sql = `
        SELECT products.id AS productId, products.name, products.price, cart_items.quantity
        FROM carts
        JOIN cart_items ON carts.id = cart_items.cart_id
        JOIN products ON cart_items.product_id = products.id
        WHERE carts.user_id = ?
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error("Fehler beim Laden des Warenkorbs:", err.message);
            return res.status(500).json({ error: "Serverfehler." });
        }
        res.json(rows);
    });
});

module.exports = router;
