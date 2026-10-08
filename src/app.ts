import express from 'express';
import { router } from './routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);
