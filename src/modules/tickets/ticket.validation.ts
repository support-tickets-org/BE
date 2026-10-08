import { z } from 'zod';
import { TICKET_PRIORITIES, TICKET_STATUSES } from './ticket.types';

const MAX_LIMIT = 50;

const title =z.string().trim().min(3).max(100);
const description = z.string().trim().max(1000);

export const createTicketSchema = z
  .object({
    title,
    description: description.optional(),
    priority: z.enum(TICKET_PRIORITIES),
  })
  .strict();

export const updateTicketSchema = z
  .object({
    title,
    description: description.nullable(),
    priority: z.enum(TICKET_PRIORITIES),
    status: z.enum(TICKET_STATUSES),
  })
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, 'At least one field is required');

export const listTicketsQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  // The spec asks to cap the limit, so oversized values are clamped rather than rejected.
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(10)
    .transform((value) => Math.min(value, MAX_LIMIT)),
});

export const ticketIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
export type TicketIdParams = z.infer<typeof ticketIdParamSchema>;
