const pool = require('../db');

// Create a new patient
exports.createPatient = async (req, res) => {
  const { name, dob, unique_id, tags, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO patients (name, dob, unique_id, tags, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, dob, unique_id, tags, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single patient
exports.getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete patient
exports.deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM patients WHERE id = $1', [id]);
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
