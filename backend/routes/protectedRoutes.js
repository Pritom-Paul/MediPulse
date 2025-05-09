const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getProtectedData } = require('../controllers/protectedController');

router.get('/protected', verifyToken, getProtectedData);

module.exports = router;