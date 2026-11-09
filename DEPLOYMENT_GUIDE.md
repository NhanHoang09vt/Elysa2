# ELYSIA NO DENSETSU – DEPLOYMENT & OPERATIONS GUIDE
## Production Builds, Containerization & Infrastructure Architecture

### Document Version: 1.0.0

---

## 1. Production Build Pipeline

The monorepo builds completely using standard `pnpm` workspace commands:

```bash
# 1. Install locked dependencies
pnpm install --frozen-lockfile

# 2. Build all shared TypeScript packages
pnpm build:packages

# 3. Build Client, Admin, and Server applications
pnpm --filter @elysia/game-server run build
pnpm --filter @elysia/game-client run build
pnpm --filter @elysia/game-admin run build
```

Build outputs are generated in each respective application's `dist/` directory:
- `apps/game-server/dist/` – Compiled Node.js ES Module server bundle.
- `apps/game-client/dist/` – Minified HTML5 client with bundled Phaser 3, Three.js, and static assets.
- `apps/game-admin/dist/` – Static React Single Page Application (SPA).

---

## 2. Environment Variables Configuration

Create a `.env` file in `apps/game-server/` with the following variables:

```ini
# Server Networking
PORT=4000
HOST=0.0.0.0
NODE_ENV=production

# Security & Sessions
JWT_SECRET=production-ultra-secure-key-elysia-2026-frontier
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://elysia.playgame.com

# Persistence
DATABASE_URL=postgresql://elysia_user:secure_pass@localhost:5432/elysia_frontier?schema=public
REDIS_URL=redis://localhost:6379

# Asset & Data Paths
DATA_DIR=/var/data/elysia/server
WORLD_DATA_PATH=/var/data/elysia/world
```

---

## 3. Docker Containerization

### 3.1 Multi-Stage Dockerfile (`Dockerfile.server`)

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/game-server ./apps/game-server
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @elysia/game-server run build

# Production Runtime Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/game-server/dist ./dist
COPY --from=builder /app/apps/game-server/package.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### 3.2 Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  game-server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
    restart: always

  game-client:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./apps/game-client/dist:/usr/share/nginx/html
      - ./deploy/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - game-server
```

---

## 4. Reverse Proxy & WebSocket Configuration (NGINX)

```nginx
server {
    listen 80;
    server_name elysia.playgame.com;

    # Static Web Client
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # REST API Proxy
    location /api/ {
        proxy_pass http://game-server:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Socket.IO Realtime Gateway
    location /socket.io/ {
        proxy_pass http://game-server:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 5. Horizontal Scaling Strategy

For multi-region scaling:
1. **Socket.IO Redis Adapter (`@socket.io/redis-adapter`):** Broadcasts socket messages across multiple server instances.
2. **Region-Based Partitioning:** Specific server clusters can host specific frontier regions (e.g., Node A runs `VIL_STARTER` and `FIELD_EAST`, Node B runs `FIELD_WEST` and `FIELD_SOUTH`), connected via Redis Pub/Sub.
