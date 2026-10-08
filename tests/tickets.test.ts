import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { migrate } from '../src/db/migrate';
import { createPool } from '../src/db/pool';

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error('TEST_DATABASE_URL is not set');

const pool = createPool(connectionString);
const app = createApp({ db: pool });

const createTicket = (body: object) => request(app).post('/api/tickets').send(body);

beforeAll(async () => {
  await migrate(pool);
});

beforeEach(async () => {
  await pool.query('TRUNCATE tickets RESTART IDENTITY');
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/tickets', () => {
  it('creates a ticket and returns 201 with status "open"', async () => {
    const res = await createTicket({ title: 'Login broken', description: 'Fails', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      title: 'Login broken',
      description: 'Fails',
      priority: 'high',
      status: 'open',
    });
  });

  it('returns 400 with field details for invalid input', async () => {
    const res = await createTicket({ title: 'ab', priority: 'urgent', extra: true });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error.details).toHaveProperty('title');
    expect(res.body.error.details).toHaveProperty('priority');
  });

  it('returns 400 for malformed JSON without leaking a stack trace', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Content-Type', 'application/json')
      .send('{"title":');

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(/stack|at .+\.js/i);
  });
});

describe('GET /api/tickets', () => {
  beforeEach(async () => {
    await createTicket({ title: 'Fix 50% discount', priority: 'low' });
    await createTicket({ title: 'Fix 500 error', priority: 'high' });
    await createTicket({ title: 'Update docs', priority: 'medium' });
    await request(app).patch('/api/tickets/3').send({ status: 'closed' });
  });

  it('paginates and returns { data, total, page, limit }', async () => {
    const res = await request(app).get('/api/tickets?page=2&limit=2');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 3, page: 2, limit: 2 });
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/tickets?status=closed');

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe('Update docs');
  });

  it('searches the title literally, treating % as a normal character', async () => {
    const res = await request(app).get('/api/tickets').query({ q: '50%' });

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe('Fix 50% discount');
  });

  it('caps limit at 50', async () => {
    const res = await request(app).get('/api/tickets?limit=500');

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
  });

  it('returns 400 for an invalid status filter', async () => {
    const res = await request(app).get('/api/tickets?status=pending');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tickets/:id', () => {
  it('updates the status', async () => {
    await createTicket({ title: 'Login broken', priority: 'high' });

    const res = await request(app).patch('/api/tickets/1').send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('returns 404 when the ticket does not exist', async () => {
    const res = await request(app).patch('/api/tickets/999').send({ status: 'closed' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for an empty body', async () => {
    await createTicket({ title: 'Login broken', priority: 'high' });

    const res = await request(app).patch('/api/tickets/1').send({});

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tickets/:id', () => {
  it('returns 204, then 404 once the ticket is gone', async () => {
    await createTicket({ title: 'Login broken', priority: 'high' });

    const first = await request(app).delete('/api/tickets/1');
    const second = await request(app).delete('/api/tickets/1');

    expect(first.status).toBe(204);
    expect(second.status).toBe(404);
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).delete('/api/tickets/abc');

    expect(res.status).toBe(400);
  });
});
