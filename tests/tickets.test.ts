import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { migrate } from '../src/db/migrate';
import { pool } from '../src/db/pool';

const createTicket = (body: object) => request(app).post('/api/tickets').send(body);

beforeAll(async () => {
  await migrate();
});

beforeEach(async () => {
  await pool.query('TRUNCATE tickets RESTART IDENTITY');
});

afterAll(async () => {
  await pool.end();
});

describe('Tickets API', () => {
  it('POST creates a ticket and returns 201', async () => {
    const res = await createTicket({ title: 'Login broken', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: 'Login broken', priority: 'high', status: 'open' });
  });

  it('POST returns 400 for invalid input', async () => {
    const res = await createTicket({ title: 'ab', priority: 'urgent' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('title');
    expect(res.body.error.details).toHaveProperty('priority');
  });

  it('GET filters by status and paginates', async () => {
    await createTicket({ title: 'First ticket', priority: 'low' });
    await createTicket({ title: 'Second ticket', priority: 'low' });
    await createTicket({ title: 'Third ticket', priority: 'low' });
    await request(app).patch('/api/tickets/1').send({ status: 'closed' });

    const res = await request(app).get('/api/tickets?status=open&page=2&limit=1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 2, page: 2, limit: 1 });
    expect(res.body.data).toHaveLength(1);
  });

  it('PATCH returns 404 when the ticket does not exist', async () => {
    const res = await request(app).patch('/api/tickets/999').send({ status: 'closed' });

    expect(res.status).toBe(404);
  });

  it('DELETE returns 204, then 404 once the ticket is gone', async () => {
    await createTicket({ title: 'Login broken', priority: 'high' });

    expect((await request(app).delete('/api/tickets/1')).status).toBe(204);
    expect((await request(app).delete('/api/tickets/1')).status).toBe(404);
  });
});
