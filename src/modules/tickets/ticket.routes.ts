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

ticketRoutes.get('/', validate(listTicketsQuerySchema, 'query'), controller.list);
ticketRoutes.post('/', validate(createTicketSchema), controller.create);
ticketRoutes.patch(
  '/:id',
  validate(ticketIdParamSchema, 'params'),
  validate(updateTicketSchema),
  controller.update,
);
ticketRoutes.delete('/:id', validate(ticketIdParamSchema, 'params'), controller.remove);
