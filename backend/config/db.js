const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Pfad zur SQLite-Datei
const dbPath = path.resolve(__dirname, 'plantie.db');

// Verbindung zur Datenbank herstellen
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err.message);
    } else {
        console.log('Verbunden mit SQLite-Datenbank unter:', dbPath);
    }
});

// Tabelle 'users' anlegen, wenn sie noch nicht existiert
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error("Fehler beim Erstellen der Tabelle:", err.message);
        }
    });
    // Produkt-Tabelle
    db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      rating INTEGER DEFAULT 0,
      image TEXT
    )
  `, (err) => {
        if (err) {
            console.error("Fehler beim Erstellen der Tabelle 'products':", err.message);
        }
    });
});

module.exports = db;
