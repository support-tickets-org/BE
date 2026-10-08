import { describe, expect, it, vi } from 'vitest';
import type { TicketRepository } from '../src/modules/tickets/ticket.repository';
import { createTicketService } from '../src/modules/tickets/ticket.service';
import { HttpError } from '../src/utils/HttpError';

const fakeRepository = (overrides: Partial<TicketRepository> = {}): TicketRepository => ({
  findMany: vi.fn().mockResolvedValue({ tickets: [], total: 0 }),
  create: vi.fn(),
  update: vi.fn().mockResolvedValue(null),
  remove: vi.fn().mockResolvedValue(false),
  ...overrides,
});

describe('ticket service', () => {
  it('wraps repository results in the paginated response shape', async () => {
    const service = createTicketService(fakeRepository());

    const result = await service.listTickets({ page: 3, limit: 5 });

    expect(result).toEqual({ data: [], total: 0, page: 3, limit: 5 });
  });

  it('throws a 404 HttpError when updating a missing ticket', async () => {
    const service = createTicketService(fakeRepository());

    await expect(service.updateTicket(1, { status: 'closed' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('throws a 404 HttpError when deleting a missing ticket', async () => {
    const service = createTicketService(fakeRepository());

    await expect(service.deleteTicket(1)).rejects.toBeInstanceOf(HttpError);
  });
});
