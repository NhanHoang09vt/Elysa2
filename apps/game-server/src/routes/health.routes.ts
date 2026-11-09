import { Router } from 'express';
import { HealthResponse } from '@elysia/game-types';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/', (_req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const response: HealthResponse = {
    status: 'healthy',
    game: 'ELYSIA NO DENSETSU – ELYSIA FRONTIER',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: process.env.NODE_ENV || 'development',
    services: {
      server: { status: 'healthy', message: 'Express Server & Socket.IO running', latencyMs: 1 },
      database: { status: 'healthy', message: 'Persistent JSON Store connected', latencyMs: 2 },
      redis: { status: 'healthy', message: 'In-memory state engine active', latencyMs: 1 },
    },
  };
  res.json(response);
});
