import { describe, expect, it } from 'vitest';
import type { TicketRepository } from '../src/modules/tickets/ticket.repository';
import { createTicketService } from '../src/modules/tickets/ticket.service';

// Fake repository where no ticket exists.
const emptyRepository: TicketRepository = {
  findMany: async () => ({ tickets: [], total: 0 }),
  create: async () => {
    throw new Error('not used');
  },
  update: async () => null,
  remove: async () => false,
};

describe('Ticket service', () => {
  const service = createTicketService(emptyRepository);

  it('throws 404 when updating a missing ticket', async () => {
    await expect(service.updateTicket(1, { status: 'closed' })).rejects.toMatchObject({ status: 404 });
  });

  it('throws 404 when deleting a missing ticket', async () => {
    await expect(service.deleteTicket(1)).rejects.toMatchObject({ status: 404 });
  });
});
