const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Missing authorization token' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optional: Check if token is blacklisted/revoked
    // if (await isTokenRevoked(token)) return res.status(401).json(...)
    
    req.doctor = decoded;
    console.log(`Doctor ${decoded.id} authenticated`);
    next();
  } catch (err) {
    console.error('JWT Error:', err.name);
    
    return res.status(403).json({
      success: false,
      error: err.name,
      message: err.name === 'TokenExpiredError' 
        ? 'Token expired. Please login again'
        : 'Invalid authentication token'
    });
  }
}

module.exports = verifyToken;