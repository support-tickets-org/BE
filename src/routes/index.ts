import { Router } from 'express';

interface ApiRoutes {
  tickets: Router;
}

export function createApiRouter(routes: ApiRoutes): Router {
  const router = Router();

  router.use('/tickets', routes.tickets);

  return router;
}
