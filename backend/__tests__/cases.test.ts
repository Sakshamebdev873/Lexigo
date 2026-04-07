import request from 'supertest';
import { buildApp } from '../src/app';

// Note: this test does not connect to MongoDB; it verifies validation behavior on the route layer.
// For a full integration test, use mongodb-memory-server.

describe('POST /api/cases validation', () => {
  const app = buildApp();
  it('rejects missing required fields with 400', async () => {
    const res = await request(app).post('/api/cases').send({ caseTitle: 'ab' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
