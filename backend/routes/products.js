const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Alle Produkte oder nach Kategorie filtern
router.get('/', (req, res) => {
    const category = req.query.category;

    const sql = category
        ? `SELECT * FROM products WHERE category = ?`
        : `SELECT * FROM products`;

    const params = category ? [category] : [];

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("Fehler beim Abrufen der Produkte:", err.message);
            return res.status(500).json({ error: "Fehler beim Laden der Produkte" });
        }
        res.json(rows);
    });
});

// POST: Neues Produkt hinzufügen
router.post('/', (req, res) => {
    const { name, description, category, price, rating, image } = req.body;

    const sql = `
    INSERT INTO products (name, description, category, price, rating, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    db.run(sql, [name, description, category, price, rating, image], function (err) {
        if (err) {
            console.error("❌ Fehler beim Hinzufügen:", err.message);
            return res.status(500).json({ error: "Produkt konnte nicht hinzugefügt werden." });
        }

        res.status(201).json({ message: "Produkt gespeichert", id: this.lastID });
    });
});

// DELETE: Produkt löschen
router.delete('/:id', (req, res) => {
    const id = req.params.id;

    db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error("❌ Fehler beim Löschen:", err.message);
            return res.status(500).json({ error: "Produkt konnte nicht gelöscht werden." });
        }

        res.status(200).json({ message: "Produkt gelöscht" });
    });
});

module.exports = router;
