import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@elysia/game-types': path.resolve(__dirname, '../../packages/game-types/src/index.ts'),
      '@elysia/game-data-schema': path.resolve(__dirname, '../../packages/game-data-schema/src/index.ts'),
      '@elysia/api-contracts': path.resolve(__dirname, '../../packages/api-contracts/src/index.ts'),
      '@elysia/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src/index.ts'),
    },
  },
});
