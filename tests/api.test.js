const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Make sure test DB is isolated
process.env.ADMIN_API_KEY = 'testkey';
process.env.PORT = 4000; // avoid conflicts

const app = require('../server');

describe('API tests', () => {
  let server;
  beforeAll((done) => {
    server = app.listen(process.env.PORT, done);
  });
  afterAll((done) => {
    server.close(done);
  });

  test('GET /api/pets returns JSON array', async () => {
    const res = await request(app).get('/api/pets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/pets rejects missing name/type', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('x-api-key', 'testkey')
      .send({ name: '', type: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name and type/i);
  });

  test('POST /api/pets rejects wrong API key', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('x-api-key', 'wrong')
      .send({ name: 'T', type: 'dog' });
    expect(res.status).toBe(401);
  });

  test('POST /api/pets creates a pet with valid data and key', async () => {
    const res = await request(app)
      .post('/api/pets')
      .set('x-api-key', 'testkey')
      .send({ name: 'JestPet', type: 'dog', years: '1 Year' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('JestPet');
  });
});