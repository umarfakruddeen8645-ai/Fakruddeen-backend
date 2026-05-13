// src/services/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('./logger');

const SECRET_KEY = process.env.JWT_SECRET;

// ✅ Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

// ✅ Hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// ✅ Compare password
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// ✅ Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn("Token missing in request");
    return res.status(401).json({ error: "Token required" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      logger.error("Invalid token: %o", err);
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

module.exports = { generateToken, hashPassword, comparePassword, authenticateToken };
