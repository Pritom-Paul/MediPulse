// const express = require('express');
// const router = express.Router();
// const verifyToken = require('../middleware/auth');

// // Just to test protected route
// router.get('/protected', verifyToken, (req, res) => {
//   res.json({ message: `Hello Doctor ${req.doctor.id}, this is protected data.` });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth.middleware'); // protects routes

// CREATE Patient
router.post('/', verifyToken, async (req, res) => {
  const { name, dob, unique_id, tags, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO patients (name, dob, unique_id, tags, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, dob, unique_id, tags, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/check-id', verifyToken, async (req, res) => {
  const { unique_id } = req.query;
  try {
    const result = await pool.query('SELECT EXISTS(SELECT 1 FROM patients WHERE unique_id = $1)', [unique_id]);
    res.json({ exists: result.rows[0].exists });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// READ all patients
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        COUNT(f.id) AS file_count
      FROM patients p
      LEFT JOIN files f ON p.id = f.patient_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// READ single patient
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        COUNT(f.id) AS file_count
      FROM patients p
      LEFT JOIN files f ON p.id = f.patient_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE patient
router.put('/:id', verifyToken, async (req, res) => {
  const { name, dob, unique_id, tags, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE patients SET name = $1, dob = $2, unique_id = $3, tags = $4, notes = $5
       WHERE id = $6 RETURNING *`,
      [name, dob, unique_id, tags, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE patient
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
