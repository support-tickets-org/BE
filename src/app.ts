import express, { type Express } from 'express';
import type { Pool } from 'pg';
import { createApiRouter } from './routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import { createTicketRepository } from './modules/tickets/ticket.repository';
import { createTicketService } from './modules/tickets/ticket.service';
import { createTicketController } from './modules/tickets/ticket.controller';
import { createTicketRoutes } from './modules/tickets/ticket.routes';

export interface AppDependencies {
  db: Pick<Pool, 'query'>;
}

// Composition root: the only place where concrete dependencies are wired together.
export function createApp({ db }: AppDependencies): Express {
  const ticketRepository = createTicketRepository(db);
  const ticketService = createTicketService(ticketRepository);
  const ticketController = createTicketController(ticketService);

  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', createApiRouter({ tickets: createTicketRoutes(ticketController) }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
