// routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Registrierung
router.post('/register', async (req, res) => {
  const { username, email, password, passwordRepeat } = req.body;

  if (!username || !email || !password || !passwordRepeat) {
    return res.status(400).json({ error: "Bitte alle Felder ausfüllen." });
  }

  if (password !== passwordRepeat) {
    return res.status(400).json({ error: "Passwörter stimmen nicht überein." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(stmt, [username, email, hashedPassword], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Email existiert bereits oder DB-Fehler" });
      }

      return res.status(201).json({
        message: "Registrierung erfolgreich!",
        user: { id: this.lastID, username, email }
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Interner Fehler bei der Registrierung" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "User nicht gefunden." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Falsches Passwort." });
  }

  return res.status(200).json({ message: "Login erfolgreich!", user: { username: user.username, email: user.email } });
});

module.exports = router;
