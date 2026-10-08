import { HttpError } from '../../utils/HttpError';
import type { TicketRepository } from './ticket.repository';
import type { PaginatedResponse, Ticket } from './ticket.types';
import type { CreateTicketDto, ListTicketsQuery, UpdateTicketDto } from './ticket.validation';

// The repository is injected so the service can be unit-tested with a fake one.
export function createTicketService(repository: TicketRepository) {
  return {
    async listTickets(query: ListTicketsQuery): Promise<PaginatedResponse<Ticket>> {
      const { tickets, total } = await repository.findMany(query);
      return { data: tickets, total, page: query.page, limit: query.limit };
    },

    createTicket(data: CreateTicketDto): Promise<Ticket> {
      return repository.create(data);
    },

    async updateTicket(id: number, changes: UpdateTicketDto): Promise<Ticket> {
      const ticket = await repository.update(id, changes);
      if (!ticket) throw new HttpError(404, 'Ticket not found');
      return ticket;
    },

    async deleteTicket(id: number): Promise<void> {
      const deleted = await repository.remove(id);
      if (!deleted) throw new HttpError(404, 'Ticket not found');
    },
  };
}
