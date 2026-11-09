import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { setupGameSockets } from './sockets/gameSocket.js';
import { runMigrationsAndSeeds } from './database/migrations.js';
import { ENV } from './config/env.js';

async function bootstrap() {
  console.log('========================================================');
  console.log(' ELYSIA NO DENSETSU – GAME SERVER & MULTIPLAYER ENGINE');
  console.log('========================================================');

  // 1. Run migrations and seed data
  await runMigrationsAndSeeds();

  // 2. Initialize Express application
  const app = createApp();
  const server = http.createServer(app);

  // 3. Initialize Socket.IO real-time multiplayer
  const io = new Server(server, {
    cors: {
      origin: ENV.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  setupGameSockets(io);

  // 4. Start HTTP & WebSocket Server
  server.listen(ENV.PORT, ENV.HOST, () => {
    console.log(`[GameServer] Listening on http://${ENV.HOST}:${ENV.PORT}`);
    console.log(`[GameServer] Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`[GameServer] Characters API: http://localhost:${ENV.PORT}/api/v1/characters`);
    console.log(`[GameServer] Admin API: http://localhost:${ENV.PORT}/api/v1/admin/dashboard`);
    console.log(`[GameServer] Socket.IO Gateway active`);
  });
}

bootstrap().catch((err) => {
  console.error('[Fatal Error] Failed to start GameServer:', err);
  process.exit(1);
});
