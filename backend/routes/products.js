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
            console.error("Error when retrieving the products:", err.message);
            return res.status(500).json({ error: "Server error." });
        }
        res.json(rows);
    });
});

// Add a new product
router.post('/', upload.single('imageFile'), (req, res) => {
    const { name, description, category, level, price, rating } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !category || !price || !rating || !image) {
        return res.status(400).json({ message: "All fields must be filled out." });
    }

    const sql = `
        INSERT INTO products (name, description, category, level, price, rating, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [name, description, category, level, price, rating, image];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Error when adding the product:", err.message);
            return res.status(500).json({ message: "Database error." });
        }

        res.json({ success: true, message: "Product successfully added." });
    });
});

// Delete Product
router.delete('/:id', (req, res) => {
    const id = req.params.id;

    db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error("Error deleting:", err.message);
            return res.status(500).json({ message: "Error deleting product." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.json({ success: true });
    });
});

module.exports = router;