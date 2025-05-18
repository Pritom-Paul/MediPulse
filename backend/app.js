const express = require('express');
const cors = require('cors');
const pool = require('./db');
const verifyToken = require('./middleware/auth'); // Make sure this exists
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Dental Management System backend is running!');
});

// Add this protected route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Protected dental data accessed successfully',
    doctor: req.doctor // Contains decoded JWT info
  });
});

// Existing routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const patientRoutes = require('./routes/patient.routes');
app.use('/api/patients', patientRoutes);

const fileRoutes = require('./routes/file.routes');
app.use('/api/files', fileRoutes);

// DB Connection Test
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected at:', result.rows[0].now);
  }
});

// Handle Multer errors and others
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.message);

  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.message === 'Unsupported file type') {
    return res.status(400).json({ error: 'Unsupported file type. Allowed: JPEG, PNG, PDF.' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
});


// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});