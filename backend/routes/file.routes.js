const express = require('express');
const router = express.Router();
const pool = require('../db');
const upload = require('../middleware/upload.middleware');
const authenticate = require('../middleware/auth.middleware');

// Upload file for a patient
router.post(
  '/upload/:patientId',
  authenticate,
  upload.single('file'),
  async (req, res) => {
    const { patientId } = req.params;
    const { file_type } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'File upload failed' });
    if (!['xray', 'receipt'].includes(file_type)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    try {
      await pool.query(
        'INSERT INTO files (patient_id, file_path, file_type) VALUES ($1, $2, $3)',
        [patientId, file.path, file_type]
      );

      res.status(201).json({ message: 'File uploaded successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

// Get all files for a patient
router.get('/list/:patientId', authenticate, async (req, res) => {
    const { patientId } = req.params;
  
    try {
      const result = await pool.query(
        'SELECT id, file_path, file_type, uploaded_at FROM files WHERE patient_id = $1',
        [patientId]
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  const path = require('path');
const fs = require('fs');

// Download a file by ID
router.get('/download/:fileId', authenticate, async (req, res) => {
  const { fileId } = req.params;

  try {
    const result = await pool.query(
      'SELECT file_path FROM files WHERE id = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = result.rows[0].file_path;
    const fullPath = path.resolve(filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File missing from server' });
    }

    res.download(fullPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a file by ID
router.delete('/delete/:fileId', authenticate, async (req, res) => {
    const { fileId } = req.params;
  
    try {
      const result = await pool.query(
        'SELECT file_path FROM files WHERE id = $1',
        [fileId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'File not found' });
      }
  
      const filePath = result.rows[0].file_path;
      const fullPath = path.resolve(filePath);
  
      // Delete file from disk if it exists
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
  
      // Remove record from DB
      await pool.query('DELETE FROM files WHERE id = $1', [fileId]);
  
      res.json({ message: 'File deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  