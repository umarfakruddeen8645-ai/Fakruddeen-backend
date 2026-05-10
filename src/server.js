require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const troubleshooting = require('./server/troubleshooting');
const { selfImprove } = require('./selfImprove');
const { transcribeAudio, detectFace } = require('./ai');
const { aiAnomalyDetection } = require('./security');
const { generateToken, hashPassword, comparePassword } = require('./auth');

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

// CREATE user
app.post('/users', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const password_hash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password_hash]
    );
    res.json({ user: result.rows[0], token: generateToken(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// LOGIN user
app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const match = await comparePassword(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ user, token: generateToken(user) });
  } catch (err) {
    next(err);
  }
});

// READ tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// UPDATE task
app.put('/tasks/:id', async (req, res, next) => {
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

// DELETE task
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Speech recognition endpoint
app.post('/speech', async (req, res, next) => {
  try {
    const { audioFile } = req.body;
    const text = transcribeAudio(audioFile);
    res.json({ transcription: text });
  } catch (err) {
    next(err);
  }
});

// Face detection endpoint
app.post('/vision', async (req, res, next) => {
  try {
    const { imageFile } = req.body;
    const result = detectFace(imageFile);
    res.json({ vision: result });
  } catch (err) {
    next(err);
  }
});

// Self-improvement endpoint
app.post('/self-improve', async (req, res, next) => {
  try {
    const { taskDescription } = req.body;
    const result = await selfImprove(taskDescription);
    res.json({ message: result });
  } catch (err) {
    next(err);
  }
});

// Remote troubleshooting endpoint
app.post('/troubleshoot', async (req, res, next) => {
  try {
    const { deviceInfo } = req.body;
    const report = runDiagnostics(deviceInfo);
    res.json({ diagnostics: report });
  } catch (err) {
    next(err);
  }
});

// Security check endpoint
app.post('/security-check', async (req, res, next) => {
  try {
    const { requestData } = req.body;
    const result = aiAnomalyDetection(requestData);
    res.json({ securityStatus: result });
  } catch (err) {
    next(err);
  }
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fakruddeen backend running on port ${PORT}`);
});
