const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'frontend/img');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Alle Produkte oder nach Kategorie filtern
router.get('/', (req, res) => {
    const category = req.query.category;
    const level = req.query.level;
    const search = req.query.search;

    let sql = `SELECT * FROM products WHERE 1=1`;
    const params = [];

    if (category) {
        sql += ` AND category = ?`;
        params.push(category);
    }

    if (level) {
        sql += ` AND level = ?`;
        params.push(level);
    }

    if (search) {
        sql += ` AND (name LIKE ? OR description LIKE ?)`;
        const searchWildcard = `%${search}%`;
        params.push(searchWildcard, searchWildcard);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("Fehler beim Abrufen der Produkte:", err.message);
            return res.status(500).json({ error: "Serverfehler." });
        }
        res.json(rows);
    });
});

router.post('/', upload.single('imageFile'), (req, res) => {
    const { name, description, category, price, rating } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !category || !price || !rating || !image) {
        return res.status(400).json({ message: "Alle Felder müssen ausgefüllt werden." });
    }

    const sql = `
        INSERT INTO products (name, description, category, price, rating, image)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [name, description, category, price, rating, image];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Fehler beim Hinzufügen des Produkts:", err.message);
            return res.status(500).json({ message: "Datenbankfehler." });
        }

        res.json({ success: true, message: "Produkt erfolgreich hinzugefügt." });
    });
});

module.exports = router;
