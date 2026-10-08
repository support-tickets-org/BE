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

  router.get('/', validate({ query: listTicketsQuerySchema }), controller.list);
  router.post('/', validate({ body: createTicketSchema }), controller.create);
  router.patch(
    '/:id',
    validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
    controller.update,
  );
  router.delete('/:id', validate({ params: ticketIdParamSchema }), controller.remove);

  return router;
}
