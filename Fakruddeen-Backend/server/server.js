// server/server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { runDiagnostics } = require('./troubleshooting');
const { selfImprove } = require('./selfImprove');
const { transcribeAudio, detectFace } = require('./ai');
const { aiAnomalyDetection } = require('./security');
const { generateToken, hashPassword, comparePassword } = require('./auth');

const app = express();
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fakruddeen',
  password: 'yourpassword',
  port: 5432,
});

// CREATE user
app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const password_hash = await hashPassword(password);
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [name, email, password_hash]
  );
  res.json({ user: result.rows[0], token: generateToken(result.rows[0]) });
});

// READ tasks
app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks');
  res.json(result.rows);
});

// UPDATE task
app.put('/tasks/:id', async (req, res) => {
  const { title, description, status } = req.body;
  const result = await pool.query(
    'UPDATE tasks SET title=$1, description=$2, status=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
    [title, description, status, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE task
app.delete('/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
  res.json({ message: 'Task deleted successfully' });
});

// Speech recognition endpoint
app.post('/speech', async (req, res) => {
  const { audioFile } = req.body;
  const text = transcribeAudio(audioFile);
  res.json({ transcription: text });
});

// Face detection endpoint
app.post('/vision', async (req, res) => {
  const { imageFile } = req.body;
  const result = detectFace(imageFile);
  res.json({ vision: result });
});

// Self-improvement endpoint
app.post('/self-improve', async (req, res) => {
  const { taskDescription } = req.body;
  const result = await selfImprove(taskDescription);
  res.json({ message: result });
});

// Remote troubleshooting endpoint
app.post('/troubleshoot', async (req, res) => {
  const { deviceInfo } = req.body;
  const report = runDiagnostics(deviceInfo);
  res.json({ diagnostics: report });
});

// Security middleware (firewall)
app.use((req, res, next) => {
  const allowedOrigins = ['https://trustedclient.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    next();
  } else {
    res.status(403).json({ error: "Access denied" });
  }
});

// Security check endpoint
app.post('/security-check', async (req, res) => {
  const { requestData } = req.body;
  const result = aiAnomalyDetection(requestData);
  res.json({ securityStatus: result });
});

// Start server
app.listen(3000, () => {
  console.log('Fakruddeen backend running on port 3000');
});
