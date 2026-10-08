import type { Request, Response } from 'express';
import * as service from './ticket.service';
import type {
  CreateTicketDto,
  ListTicketsQuery,
  TicketIdParams,
  UpdateTicketDto,
} from './ticket.validation';

export async function list(_req: Request, res: Response) {
  const result = await service.listTickets(res.locals.query as ListTicketsQuery);
  res.json(result);
}

export async function create(_req: Request, res: Response) {
  const ticket = await service.createTicket(res.locals.body as CreateTicketDto);
  res.status(201).json(ticket);
}

export async function update(_req: Request, res: Response) {
  const { id } = res.locals.params as TicketIdParams;
  const ticket = await service.updateTicket(id, res.locals.body as UpdateTicketDto);
  res.json(ticket);
}

export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.params as TicketIdParams;
  await service.deleteTicket(id);
  res.status(204).end();
}
