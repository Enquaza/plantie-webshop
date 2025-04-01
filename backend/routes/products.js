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

module.exports = router;
