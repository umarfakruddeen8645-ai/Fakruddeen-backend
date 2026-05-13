require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const logger = require('./services/logger');
const { generateToken, hashPassword, comparePassword } = require('./services/auth');

const usersRouter = require('./routes/users');

const app = express();
app.use(bodyParser.json());

// ✅ Morgan HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// ✅ Flexible CORS config
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://fakruddeen-backend-roip.onrender.com'],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// ✅ Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false },
  keepAlive: true,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000
});

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

/* ============================
   JWT AUTHENTICATION MIDDLEWARE
============================ */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn("Token missing in request");
    return res.status(401).json({ error: "Token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error("Invalid token: %o", err);
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

/* ============================
   ROOT & USERS ROUTES
============================ */
app.get("/", (req, res) => {
  logger.info("Root endpoint accessed");
  res.send("Fakruddeen backend is live 🚀");
});

app.use('/', usersRouter);

/* ============================
   ERROR HANDLING & SERVER START
============================ */
app.use((err, req, res, next) => {
  logger.error("Unhandled error: %o", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000; // ✅ Render zai saka PORT daidai
app.listen(PORT, () => {
  logger.info(`Fakruddeen backend running on port ${PORT}`);
});
