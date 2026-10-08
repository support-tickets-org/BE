import express from 'express';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import { ticketRoutes } from './modules/tickets/ticket.routes';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.use('/api/tickets', ticketRoutes);

app.use(notFound);
app.use(errorHandler);
