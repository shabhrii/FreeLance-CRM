import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

import clientsRouter from './modules/clients/clients.routes';
import projectsRouter from './modules/projects/projects.routes';
import invoicesRouter from './modules/invoices/invoices.routes';
import aiRouter from './modules/ai/ai.routes';
import analyticsRouter from './modules/analytics/analytics.routes';

app.use('/api/clients', clientsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'FreelanceFlow API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
