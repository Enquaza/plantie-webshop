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
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  if (password !== passwordRepeat) {
    return res.status(400).json({ error: "Passwords do not match." });
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
        return res.status(500).json({ error: "DB-Error" });
      }

      return res.status(201).json({
        message: "Registration successful!",
        user: { id: this.lastID, username, email }
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error during registration" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { identifier, password, remember } = req.body;

  //debug
  console.log("Request data:", req.body);
  const sql = `SELECT * FROM users WHERE email = ? OR username = ?`;

  db.get(sql, [identifier, identifier], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error during login." });
    }

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    if (user.active !== 1) {
      return res.status(403).json({ error: "Your account has been deactivated." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Wrong password." });
    }

    //Session setzen
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      paymentInfo: user.paymentInfo,
      address: user.address
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
      message: "Login successful for: " + identifier + "!",
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
        isAdmin: req.session.user.isAdmin,
        paymentInfo: req.session.user.paymentInfo || null,
        address: req.session.user.address || null
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
    return res.status(401).json({ error: "Not logged in." });
  }

  if (!passwordConfirm) {
    return res.status(400).json({ error: "Password must be entered for confirmation." });
  }

  // Holt den aktuellen User aus der Datenbank
  db.get('SELECT * FROM users WHERE id = ?', [req.session.user.id], async (err, user) => {
    if (err) {
      console.error('DB-Fehler:', err.message);
      return res.status(500).json({ error: "Server error when reading the user." });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Passwort prüfen
    const match = await bcrypt.compare(passwordConfirm, user.password);
    if (!match) {
      return res.status(403).json({ error: "Wrong password." });
    }

    // Update durchführen
    const stmt = `
          UPDATE users
          SET address = ?, paymentInfo = ?
          WHERE id = ?
        `;
    db.run(stmt, [address || user.address, paymentInfoNew || user.paymentInfo, req.session.user.id], function (err) {
      if (err) {
        console.error('DB update error:', err.message);
        return res.status(500).json({ error: "Error when updating the data." });
      }

      req.session.user.paymentInfo = paymentInfoNew || user.paymentInfo;
      req.session.user.address = address || user.address;

      return res.json({ message: "Data successfully updated!" });
    });
  });
});

// Logout-Route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    // Cookie löschen (optional)
    res.clearCookie('connect.sid');
    return res.json({ message: "Logout successful" });
    console.log("User has been logged out. Cookie will be deleted.");
  });
});

module.exports = router;