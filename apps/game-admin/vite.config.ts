import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
  },
  resolve: {
    alias: {
      '@elysia/game-types': path.resolve(__dirname, '../../packages/game-types/src/index.ts'),
      '@elysia/game-data-schema': path.resolve(__dirname, '../../packages/game-data-schema/src/index.ts'),
      '@elysia/api-contracts': path.resolve(__dirname, '../../packages/api-contracts/src/index.ts'),
    },
  },
});
