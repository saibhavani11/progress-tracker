// server.js — app entry point.
const express = require('express');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const requireAuth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Health check — also doubles as your first uptime-monitoring target later.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRouter);          // public: signup, login
app.use('/tasks', requireAuth, tasksRouter); // protected: requires a valid JWT

const PORT = process.env.PORT || 4000;

// Only start listening when this file is run directly (e.g. `node server.js`),
// not when it's imported elsewhere — like in tests, where supertest just
// needs the `app` object, not a running server. Without this check, the test
// suite would open a second server that's never closed, causing Jest to hang.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = app; // exported for tests (supertest)
