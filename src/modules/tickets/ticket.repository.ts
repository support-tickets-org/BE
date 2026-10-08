import { pool } from '../../db/pool';
import type { Ticket, TicketPriority, TicketStatus } from './ticket.types';
import type { CreateTicketDto, ListTicketsQuery, UpdateTicketDto } from './ticket.validation';

interface TicketRow {
  id: number;
  title: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: Date;
  updated_at: Date;
}

const COLUMNS = 'id, title, description, priority, status, created_at, updated_at';

const toTicket = (row: TicketRow): Ticket => ({
  id: row.id,
  title: row.title,
  description: row.description,
  priority: row.priority,
  status: row.status,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

// Without escaping, a search for "50%" or "a_b" would be treated as a LIKE wildcard.
const escapeLike = (value: string) => value.replace(/[\%_]/g, '\$&');

export async function findMany({ status, q, page, limit }: ListTicketsQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (q) {
    values.push(`%${escapeLike(q)}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM tickets ${where}`,
    values,
  );

  const rowsResult = await pool.query<TicketRow>(
    `SELECT ${COLUMNS} FROM tickets ${where}
     ORDER BY created_at DESC, id DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, (page - 1) * limit],
  );

  return { tickets: rowsResult.rows.map(toTicket), total: countResult.rows[0].total };
}

export async function create({ title, description, priority }: CreateTicketDto): Promise<Ticket> {
  const { rows } = await pool.query<TicketRow>(
    `INSERT INTO tickets (title, description, priority)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [title, description ?? null, priority],
  );
  return toTicket(rows[0]);
}

export async function update(id: number, changes: UpdateTicketDto): Promise<Ticket | null> {
  const fields = Object.entries(changes).filter(([, value]) => value !== undefined);
  // Column names come from the validated schema keys, never from raw user input.
  const assignments = fields.map(([column], index) => `${column} = $${index + 2}`);

  const { rows } = await pool.query<TicketRow>(
    `UPDATE tickets
     SET ${assignments.join(', ')}, updated_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, ...fields.map(([, value]) => value)],
  );
  return rows[0] ? toTicket(rows[0]) : null;
}

export async function remove(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
  return rowCount === 1;
}
