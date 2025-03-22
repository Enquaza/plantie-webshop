// backend/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Pfad zur SQLite-Datei (wird automatisch erstellt, wenn nicht vorhanden)
const dbPath = path.resolve(__dirname, 'plantie.db');

// Verbindung zur Datenbank herstellen
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Fehler beim Öffnen der Datenbank:', err.message);
    } else {
        console.log('✅ Verbunden mit SQLite-Datenbank unter:', dbPath);
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
            console.error("❌ Fehler beim Erstellen der Tabelle:", err.message);
        } else {
            console.log("✅ Tabelle 'users' bereit.");
        }
    });
});

module.exports = db;
