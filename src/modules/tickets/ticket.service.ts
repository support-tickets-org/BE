import { HttpError } from '../../utils/HttpError';
import * as repository from './ticket.repository';
import type { PaginatedResponse, Ticket } from './ticket.types';
import type { CreateTicketDto, ListTicketsQuery, UpdateTicketDto } from './ticket.validation';

export async function listTickets(query: ListTicketsQuery): Promise<PaginatedResponse<Ticket>> {
  const { tickets, total } = await repository.findMany(query);
  return { data: tickets, total, page: query.page, limit: query.limit };
}

export function createTicket(data: CreateTicketDto): Promise<Ticket> {
  return repository.create(data);
}

export async function updateTicket(id: number, changes: UpdateTicketDto): Promise<Ticket> {
  const ticket = await repository.update(id, changes);
  if (!ticket) throw new HttpError(404, 'Ticket not found');
  return ticket;
}

export async function deleteTicket(id: number): Promise<void> {
  const deleted = await repository.remove(id);
  if (!deleted) throw new HttpError(404, 'Ticket not found');
}
