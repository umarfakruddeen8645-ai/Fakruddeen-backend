require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// 👉 duk modules suna cikin src/services
const { runDiagnostics } = require('./services/troubleshooting');
const { selfImprove } = require('./services/selfImprove');
const { transcribeAudio } = require('./services/ai');
const { detectFace } = require('./services/face');
const { aiAnomalyDetection } = require('./services/security');
const { generateToken, hashPassword, comparePassword } = require('./services/auth');

const app = express();
app.use(bodyParser.json());

// ✅ Flexible CORS config
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://trustedclient.com'],
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// ✅ Database connection with env variables
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

/* ============================
   JWT AUTHENTICATION MIDDLEWARE
============================ */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

/* ============================
   USER AUTHENTICATION ROUTES
============================ */

// REGISTER user
app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password_hash]
    );
    const user = result.rows[0];
    res.status(201).json({ user, token: generateToken(user) });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email }, token: generateToken(user) });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ============================
   TASK MANAGEMENT ROUTES
============================ */

// READ tasks (protected)
app.get('/tasks', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id=$1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// CREATE task (protected)
app.post('/tasks', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// UPDATE task (protected)
app.put('/tasks/:id', authenticateToken, async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, status=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
      [title, description, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE task (protected)
app.delete('/tasks/:id', authenticateToken, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/* ============================
   AI & UTILITIES ROUTES
============================ */

app.post('/speech', upload.single('audio'), async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '..', req.file.path);
    const text = await transcribeAudio(filePath);
    res.json({ transcription: text });
  } catch (err) {
    next(err);
  }
});

app.post('/vision', upload.single('image'), async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '..', req.file.path);
    const result = await detectFace(filePath);
    res.json({ vision: result });
  } catch (err) {
    next(err);
  }
});

app.post('/self-improve', async (req, res, next) => {
  try {
    const { taskDescription } = req.body;
    const result = await selfImprove(taskDescription);
    res.json({ message: result });
  } catch (err) {
    next(err);
  }
});

app.post('/troubleshoot', async (req, res, next) => {
  try {
    const { deviceInfo } = req.body;
    const report = runDiagnostics(deviceInfo);
    res.json({ diagnostics: report });
  } catch (err) {
    next(err);
  }
});

app.post('/security-check', async (req, res, next) => {
  try {
    const { requestData } = req.body;
    const result = aiAnomalyDetection(requestData);
    res.json({ securityStatus: result });
  } catch (err) {
    next(err);
  }
});

/* ============================
   ERROR HANDLING & SERVER START
============================ */

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fakruddeen backend running on port ${PORT}`);
});
