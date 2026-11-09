import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Locate the monorepo root reliably
const ROOT_DIR = path.resolve(__dirname, '../../../../');

export const ENV = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  JWT_SECRET: process.env.JWT_SECRET || 'elysia-frontier-jwt-secret-dev-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATA_DIR: path.resolve(ROOT_DIR, 'apps/game-server/data'),
  WORLD_DATA_PATH: path.resolve(ROOT_DIR, 'apps/game-client/public/data/world'),
  UPLOADS_DIR: path.resolve(ROOT_DIR, 'apps/game-admin/public/assets'),
};
