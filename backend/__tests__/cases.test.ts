import request from 'supertest';
import { buildApp } from '../src/app';


describe('POST /api/cases validation', () => {
  const app = buildApp();
  it('rejects missing required fields with 400', async () => {
    const res = await request(app).post('/api/cases').send({ caseTitle: 'ab' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
