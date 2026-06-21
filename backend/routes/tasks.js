// routes/tasks.js — all task-related endpoints. Every route here requires
// a valid JWT (see server.js) and every query is scoped to req.userId, so
// users only ever see and modify their own tasks.
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tasks?date=YYYY-MM-DD  → list tasks for a given day (defaults to today)
router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 AND task_date = $2 ORDER BY id ASC',
      [req.userId, date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks  { title, task_date }  → create a new task
router.post('/', async (req, res) => {
  const { title, task_date } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, task_date) VALUES ($1, $2, COALESCE($3, CURRENT_DATE)) RETURNING *',
      [req.userId, title, task_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id/toggle  → flip completed true/false (only if it's your own task)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE tasks SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'task not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tasks/streak  → current consecutive-day streak where ALL tasks that day were completed
router.get('/streak', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT task_date,
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE completed) AS done
      FROM tasks
      WHERE user_id = $1
      GROUP BY task_date
      ORDER BY task_date DESC
    `, [req.userId]);

    let streak = 0;
    for (const row of rows) {
      if (Number(row.total) > 0 && Number(row.done) === Number(row.total)) {
        streak += 1;
      } else {
        break;
      }
    }
    res.json({ streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tasks/history  → last 90 days of completion data, for the heatmap calendar
router.get('/history', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT task_date,
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE completed) AS done
      FROM tasks
      WHERE user_id = $1 AND task_date >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY task_date
      ORDER BY task_date ASC
    `, [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
