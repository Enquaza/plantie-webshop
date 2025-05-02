const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Registrierung
router.post('/register', async (req, res) => {
  const {
    salutation,
    firstName,
    lastName,
    address,
    zipCode,
    city,
    email,
    username,
    password,
    passwordRepeat,
    paymentInfo
  } = req.body;

  if (!salutation || !firstName || !lastName || !address || !zipCode || !city || !email || !username || !password || !passwordRepeat || !paymentInfo) {
    return res.status(400).json({ error: "Bitte alle Felder ausfüllen." });
  }

  if (password !== passwordRepeat) {
    return res.status(400).json({ error: "Passwörter stimmen nicht überein." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const stmt = `INSERT INTO users (
      salutation, firstName, lastName, address, zipCode, city,
      email, username, password, paymentInfo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(stmt, [
      salutation, firstName, lastName, address, zipCode, city,
      email, username, hashedPassword, paymentInfo
    ], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "DB-Fehler" });
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
  const { email, password, remember } = req.body;

  //debug
  console.log("Anfrage-Daten:", req.body);
  const sql = `SELECT * FROM users WHERE email = ?`;

  db.get(sql, [email], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Datenbankfehler beim Login." });
    }

    if (!user) {
      return res.status(401).json({ error: "User nicht gefunden." });
    }

    if (user.active !== 1) {
      return res.status(403).json({ error: "Ihr Konto wurde deaktiviert." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Falsches Passwort." });
    }

    //Session setzen
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    };

    //Cookie setzen, wenn "Login merken" gewählt wurde
    if (remember) {
      req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 1 Woche
      console.log("Session-Cookie maxAge:", req.session.cookie.maxAge);
    } else {
      req.session.cookie.expires = false;
      req.session.cookie.maxAge = undefined;
      console.log("Session-Cookie maxAge:", req.session.cookie.maxAge);
    }

    return res.status(200).json({
      message: "Login erfolgreich!",
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Check-Route: Ist der User eingeloggt?
router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        email: req.session.user.email,
        isAdmin: req.session.user.isAdmin
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// ✏️ Update-Route für Userdaten
router.post('/update', async (req, res) => {
  const { address, paymentInfoNew, passwordConfirm } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ error: "Nicht eingeloggt." });
  }

  if (!passwordConfirm) {
    return res.status(400).json({ error: "Passwort muss zur Bestätigung eingegeben werden." });
  }

  // Holt den aktuellen User aus der Datenbank
  db.get('SELECT * FROM users WHERE id = ?', [req.session.user.id], async (err, user) => {
    if (err) {
      console.error('DB-Fehler:', err.message);
      return res.status(500).json({ error: "Serverfehler beim Lesen des Users." });
    }

    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden." });
    }

    // Passwort prüfen
    const match = await bcrypt.compare(passwordConfirm, user.password);
    if (!match) {
      return res.status(403).json({ error: "Falsches Passwort." });
    }

    // Update durchführen
    const stmt = `
          UPDATE users
          SET address = ?, paymentInfo = ?
          WHERE id = ?
        `;
    db.run(stmt, [address || user.address, paymentInfoNew || user.paymentInfo, req.session.user.id], function (err) {
      if (err) {
        console.error('DB-Update-Fehler:', err.message);
        return res.status(500).json({ error: "Fehler beim Aktualisieren der Daten." });
      }

      return res.json({ message: "Daten erfolgreich aktualisiert!" });
    });
  });
});


// Logout-Route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout-Fehler:", err);
      return res.status(500).json({ error: "Logout fehlgeschlagen" });
    }

    // Cookie löschen (optional)
    res.clearCookie('connect.sid');
    return res.json({ message: "Logout erfolgreich" });
    console.log("User wurde ausgeloggt. Cookie wird gelöscht.");
  });
});

module.exports = router;
