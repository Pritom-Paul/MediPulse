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
    if (!['xray', 'prescription'].includes(file_type)) {
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
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Download a file by ID
const jwt = require('jsonwebtoken'); // Add this near the top of your file if not already present

router.get('/download/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Proceed with file retrieval
    const result = await pool.query(
      'SELECT file_path FROM files WHERE id = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = result.rows[0].file_path;
    const fullPath = path.resolve(filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File missing from server' });
    }

    // Serve file with inline disposition for viewing in iframe or image
    const fileName = path.basename(fullPath);
    res.sendFile(fullPath, {
      headers: {
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid or expired token' });
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
  
const archiver = require('archiver');

router.get('/download-all/:patientId', authenticate, async (req, res) => {
  const { patientId } = req.params;

  try {
    const result = await pool.query(
      'SELECT file_path FROM files WHERE patient_id = $1',
      [patientId]
    );

    const files = result.rows;

    if (files.length === 0) {
      return res.status(404).json({ message: 'No files found for this patient' });
    }

    res.setHeader('Content-Disposition', `attachment; filename=patient_${patientId}_files.zip`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    files.forEach((file, index) => {
      const fullPath = path.resolve(file.file_path);
      const filename = path.basename(fullPath);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: `${index + 1}_${filename}` });
      }
    });

    archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});