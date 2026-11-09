import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { characterRouter } from './routes/character.routes.js';
import { gameRouter } from './routes/game.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { ENV } from './config/env.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static Assets (uploads & sprites)
  app.use('/assets', express.static(ENV.UPLOADS_DIR));

  // Request logger
  app.use((req, _res, next) => {
    if (req.path !== '/api/v1/health') {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Mount API v1 Routes
  const apiV1 = express.Router();
  apiV1.use('/health', healthRouter);
  apiV1.use('/auth', authRouter);
  apiV1.use('/characters', characterRouter);
  apiV1.use('/game', gameRouter);
  apiV1.use('/admin', adminRouter);

  app.use('/api/v1', apiV1);

  // 404 Handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint không tồn tại.' });
  });

  return app;
}
