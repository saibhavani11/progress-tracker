// __tests__/health.test.js — minimal smoke test so the CI pipeline has something real to run.
const request = require('supertest');
const app = require('../server');
const pool = require('../db');

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

afterAll(async () => {
  await pool.end();
});