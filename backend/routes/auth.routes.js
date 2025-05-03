const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register doctor
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingDoctor = await pool.query('SELECT * FROM doctors WHERE username = $1', [username]);
    if (existingDoctor.rows.length > 0) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO doctors (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login doctor
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const doctor = await pool.query('SELECT * FROM doctors WHERE username = $1', [username]);
    if (doctor.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: doctor.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
