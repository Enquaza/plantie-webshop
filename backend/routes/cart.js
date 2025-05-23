const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Produkt zum Warenkorb hinzufügen
router.post('/add', (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.status(401).json({ error: "Please log in first!" });
    }

    // 1. Hat der User schon einen Warenkorb?
    const findCartSql = `SELECT id FROM carts WHERE user_id = ?`;
    db.get(findCartSql, [userId], (err, cartRow) => {
        if (err) {
            console.error("Error when searching the cart:", err.message);
            return res.status(500).json({ error: "Server error." });
        }

        const cartId = cartRow ? cartRow.id : null;

        function addItemToCart(cartId) {
            // Prüfen ob Produkt schon im Warenkorb
            const checkItemSql = `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`;
            db.get(checkItemSql, [cartId, productId], (err, itemRow) => {
                if (err) {
                    console.error("Error when checking the item:", err.message);
                    return res.status(500).json({ error: "Server error." });
                }

                if (itemRow) {
                    // Menge erhöhen
                    const updateSql = `UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?`;
                    db.run(updateSql, [itemRow.id], function (err) {
                        if (err) {
                            console.error("Error when increasing the quantity:", err.message);
                            return res.status(500).json({ error: "Server error." });
                        }
                        res.json({ success: true });
                    });
                } else {
                    // Neues Produkt einfügen
                    const insertSql = `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)`;
                    db.run(insertSql, [cartId, productId], function (err) {
                        if (err) {
                            console.error("Error when inserting the product:", err.message);
                            return res.status(500).json({ error: "Server error." });
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
                    console.error("Error when creating the cart:", err.message);
                    return res.status(500).json({ error: "Server error." });
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
        return res.status(401).json({ error: "Please log in first!" });
    }

    // Schritt 1: Den Warenkorb des Users finden
    const findCartSql = `SELECT id FROM carts WHERE user_id = ?`;
    db.get(findCartSql, [userId], (err, cartRow) => {
        if (err) {
            console.error("Error when searching the cart:", err.message);
            return res.status(500).json({ error: "Server error." });
        }

        if (!cartRow) {
            return res.status(400).json({ error: "No cart found." });
        }

        const cartId = cartRow.id;

        // Schritt 2: Das Produkt aus dem Warenkorb entfernen
        const deleteSql = `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`;
        db.run(deleteSql, [cartId, productId], function (err) {
            if (err) {
                console.error("Error when removing the product:", err.message);
                return res.status(500).json({ error: "Server error." });
            }

            if (this.changes > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: "Product not found in cart." });
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
            console.error("Error loading the cart:", err.message);
            return res.status(500).json({ error: "Server error." });
        }
        res.json(rows);
    });
});

router.post('/checkout', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;
    const paymentMethod = req.body.paymentMethod;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Please log in first!" });
    }

    if (!paymentMethod) {
        return res.status(400).json({ success: false, message: "Payment method missing." });
    }

    // 1. Warenkorb finden
    const findCartSql = `SELECT id FROM carts WHERE user_id = ?`;
    db.get(findCartSql, [userId], (err, cartRow) => {
        if (err) {
            console.error("Error when searching the cart:", err.message);
            return res.status(500).json({ success: false, message: "Server error." });
        }

        if (!cartRow) {
            return res.status(400).json({ success: false, message: "No cart found." });
        }

        const cartId = cartRow.id;

        // 2. cart_items abrufen
        const cartItemsSql = `
            SELECT product_id, quantity
            FROM cart_items
            WHERE cart_id = ?
        `;
        db.all(cartItemsSql, [cartId], (err, items) => {
            if (err) {
                console.error("Error when retrieving cart items:", err.message);
                return res.status(500).json({ success: false, message: "Server error." });
            }

            if (!items || items.length === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty." });
            }

            // 3. Bestellung (orders) erstellen → Zahlungsmethode speichern!
            const insertOrderSql = `INSERT INTO orders (user_id, payment_method) VALUES (?, ?)`;
            db.run(insertOrderSql, [userId, paymentMethod], function (err) {
                if (err) {
                    console.error("Error when creating the order:", err.message);
                    return res.status(500).json({ success: false, message: "Server error." });
                }

                const orderId = this.lastID;

                // 4. order_items einfügen
                const insertItemSql = `INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)`;

                let itemsProcessed = 0;

                items.forEach(item => {
                    db.run(insertItemSql, [orderId, item.product_id, item.quantity], function (err) {
                        if (err) {
                            console.error("Error when adding products to the order:", err.message);
                            return res.status(500).json({ success: false, message: "Server error." });
                        }

                        itemsProcessed++;

                        if (itemsProcessed === items.length) {
                            // 5. cart_items löschen
                            const deleteCartItemsSql = `DELETE FROM cart_items WHERE cart_id = ?`;
                            db.run(deleteCartItemsSql, [cartId], function (err) {
                                if (err) {
                                    console.error("Error when emptying the cart:", err.message);
                                    return res.status(500).json({ success: false, message: "Server error." });
                                }

                                res.json({ success: true });
                            });
                        }
                    });
                });
            });
        });
    });
});

// Menge ändern (+1 oder -1)
router.post('/update', (req, res) => {
    const { productId, delta } = req.body;
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.status(401).json({ error: "Please log in first!" });
    }

    // Warenkorb-ID ermitteln
    const findCartSql = `SELECT id FROM carts WHERE user_id = ?`;
    db.get(findCartSql, [userId], (err, cartRow) => {
        if (err || !cartRow) {
            console.error("Error getting the cart: ", err?.message);
            return res.status(500).json({ error: "Server error or nonexistent cart." });
        }

        const cartId = cartRow.id;

        // Schritt 2: Aktuelle Menge abrufen
        const getItemSql = `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`;
        db.get(getItemSql, [cartId, productId], (err, item) => {
            if (err || !item) {
                return res.status(400).json({ error: "Product not found in cart." });
            }

            const newQty = item.quantity + delta;

            if (newQty < 1) {
                // Produkt entfernen
                const deleteSql = `DELETE FROM cart_items WHERE id = ?`;
                db.run(deleteSql, [item.id], function (err) {
                    if (err) {
                        console.error("Error deleting", err.message);
                        return res.status(500).json({ error: "Error deleting" });
                    }
                    return res.json({ success: true, removed: true });
                });
            } else {
                // Menge aktualisieren
                const updateSql = `UPDATE cart_items SET quantity = ? WHERE id = ?`;
                db.run(updateSql, [newQty, item.id], function (err) {
                    if (err) {
                        console.error("Error updating", err.message);
                        return res.status(500).json({ error: "Error updating" });
                    }
                    return res.json({ success: true });
                });
            }
        });
    });
});

module.exports = router;