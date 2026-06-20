// server.js — app entry point.
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — also doubles as your first uptime-monitoring target later.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/tasks', tasksRouter);

const PORT = process.env.PORT || 4000;

// Only start listening when this file is run directly (e.g. `node server.js`),
// not when it's imported elsewhere — like in tests, where supertest just
// needs the `app` object, not a running server.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = app;