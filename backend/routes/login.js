// routes/login.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Demo: Fake-Datenbank (später ersetzen mit echter DB)
const users = []; // Temporär für gespeicherte User

// Registrierung
router.post('/register', async (req, res) => {
  const { username, email, password, passwordRepeat } = req.body;

  // Basic-Validierung
  if (!username || !email || !password || !passwordRepeat) {
    return res.status(400).json({ error: "Bitte alle Felder ausfüllen." });
  }

  if (password !== passwordRepeat) {
    return res.status(400).json({ error: "Passwörter stimmen nicht überein." });
  }

  // Passwort hashen
  const hashedPassword = await bcrypt.hash(password, 10);

  // In 'Datenbank' speichern
  const newUser = { username, email, password: hashedPassword };
  users.push(newUser);

  return res.status(201).json({ message: "Registrierung erfolgreich!", user: { username, email } });
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
