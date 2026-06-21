// routes/push.js — lets the frontend register a browser for push
// notifications. Each browser/device gets its own subscription row.
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/subscribe', async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'invalid subscription payload' });
  }
  try {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
      [req.userId, endpoint, keys.p256dh, keys.auth]
    );
    res.status(201).json({ subscribed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body;
  try {
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2', [endpoint, req.userId]);
    res.json({ unsubscribed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
