import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import type { TicketController } from './ticket.controller';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
} from './ticket.validation';

export function createTicketRoutes(controller: TicketController): Router {
  const router = Router();

  router.get('/', validate(listTicketsQuerySchema, 'query'), controller.list);
  router.post('/', validate(createTicketSchema), controller.create);
  router.patch(
    '/:id',
    validate(ticketIdParamSchema, 'params'),
    validate(updateTicketSchema),
    controller.update,
  );
  router.delete('/:id', validate(ticketIdParamSchema, 'params'), controller.remove);

  return router;
}
