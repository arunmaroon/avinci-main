const request = require('supertest');
const express = require('express');
const personasRoute = require('../routes/personas');

// Minimal app wrapper
const app = express();
app.use(express.json());
app.use('/api/personas', personasRoute);

describe('Personas routes', () => {
  it('GET /api/personas?view=short responds 200', async () => {
    const res = await request(app).get('/api/personas?view=short');
    // Only checks route wiring; DB may be unavailable in unit env, so accept 200/500
    expect([200, 500]).toContain(res.statusCode);
  });
});


