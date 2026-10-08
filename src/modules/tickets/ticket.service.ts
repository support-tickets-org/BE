import { HttpError } from '../../utils/HttpError';
import type { TicketRepository } from './ticket.repository';
import type { PaginatedResponse, Ticket } from './ticket.types';
import type { CreateTicketDto, ListTicketsQuery, UpdateTicketDto } from './ticket.validation';

export interface TicketService {
  listTickets(query: ListTicketsQuery): Promise<PaginatedResponse<Ticket>>;
  createTicket(data: CreateTicketDto): Promise<Ticket>;
  updateTicket(id: number, changes: UpdateTicketDto): Promise<Ticket>;
  deleteTicket(id: number): Promise<void>;
}

export function createTicketService(repository: TicketRepository): TicketService {
  return {
    async listTickets(query) {
      const { tickets, total } = await repository.findMany(query);
      return { data: tickets, total, page: query.page, limit: query.limit };
    },

    createTicket(data) {
      return repository.create(data);
    },

    async updateTicket(id, changes) {
      const ticket = await repository.update(id, changes);
      if (!ticket) throw new HttpError(404, 'Ticket not found');
      return ticket;
    },

    async deleteTicket(id) {
      const deleted = await repository.remove(id);
      if (!deleted) throw new HttpError(404, 'Ticket not found');
    },
  };
}
