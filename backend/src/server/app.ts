import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../routes/auth.routes';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // app.get('/', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);

  return app;
}

export default createApp;
