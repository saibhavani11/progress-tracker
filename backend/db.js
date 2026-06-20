// db.js — single Postgres connection pool shared across the app.
// Connection details come from environment variables (see .env.example).
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'progress_tracker',
});

module.exports = pool;
