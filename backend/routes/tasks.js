// routes/tasks.js — all task-related endpoints.
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /tasks?date=YYYY-MM-DD  → list tasks for a given day (defaults to today)
router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE task_date = $1 ORDER BY id ASC',
      [date]
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
      'INSERT INTO tasks (title, task_date) VALUES ($1, COALESCE($2, CURRENT_DATE)) RETURNING *',
      [title, task_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id/toggle  → flip completed true/false
router.patch('/:id/toggle', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE tasks SET completed = NOT completed WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'task not found' });
    res.json(result.rows[0]);
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
      GROUP BY task_date
      ORDER BY task_date DESC
    `);

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

module.exports = router;
