import type { RequestHandler } from 'express';
import type { TicketService } from './ticket.service';
import type {
  CreateTicketDto,
  ListTicketsQuery,
  TicketIdParams,
  UpdateTicketDto,
} from './ticket.validation';

export interface TicketController {
  list: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
}

export function createTicketController(service: TicketService): TicketController {
  return {
    async list(_req, res) {
      const result = await service.listTickets(res.locals.query as ListTicketsQuery);
      res.json(result);
    },

    async create(_req, res) {
      const ticket = await service.createTicket(res.locals.body as CreateTicketDto);
      res.status(201).json(ticket);
    },

    async update(_req, res) {
      const { id } = res.locals.params as TicketIdParams;
      const ticket = await service.updateTicket(id, res.locals.body as UpdateTicketDto);
      res.json(ticket);
    },

    async remove(_req, res) {
      const { id } = res.locals.params as TicketIdParams;
      await service.deleteTicket(id);
      res.status(204).end();
    },
  };
}
