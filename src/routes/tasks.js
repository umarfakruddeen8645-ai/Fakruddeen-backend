const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../services/auth');
const logger = require('../services/logger'); // ✅ gyara path

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false }
});

// Create task
router.post('/tasks', authenticateToken, async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error("Failed to create task: %o", err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get tasks
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id=$1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    logger.error("Failed to fetch tasks: %o", err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update task
router.put('/tasks/:id', authenticateToken, async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title=$1, description=$2, status=$3, updated_at=NOW() WHERE id=$4 AND user_id=$5 RETURNING *',
      [title, description, status, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    logger.error("Failed to update task: %o", err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    logger.error("Failed to delete task: %o", err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
