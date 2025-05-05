const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if doctor exists
    const doctorResult = await pool.query(
      'SELECT * FROM doctors WHERE username = $1',
      [username]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const doctor = doctorResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ doctorId: doctor.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, message: 'Login successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
app.use('/api/patients', require('./routes/patient.routes'));