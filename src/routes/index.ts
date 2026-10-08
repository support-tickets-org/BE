import { Router } from 'express';
import { ticketRoutes } from '../modules/tickets/ticket.routes';

export const router = Router();

router.use('/tickets', ticketRoutes);
