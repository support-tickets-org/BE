import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import * as controller from './ticket.controller';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
} from './ticket.validation';

export const ticketRoutes = Router();

ticketRoutes.get('/', validate({ query: listTicketsQuerySchema }), controller.list);
ticketRoutes.post('/', validate({ body: createTicketSchema }), controller.create);
ticketRoutes.patch(
  '/:id',
  validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
  controller.update,
);
ticketRoutes.delete('/:id', validate({ params: ticketIdParamSchema }), controller.remove);
