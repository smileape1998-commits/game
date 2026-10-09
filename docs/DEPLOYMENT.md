# HAMSTER COUP: GOLDEN ACORNS — PRODUCTION DEPLOYMENT GUIDE

This guide details how to build, containerize, and deploy **Hamster Coup: Golden Acorns** to production environments.

---

## 1. System Requirements

* **Node.js**: v20.x or v22.x LTS / v24.x
* **npm**: v10+
* **PostgreSQL**: v14+ (optional for production persistence of match stats)
* **Docker & Docker Compose**: v24+

---

## 2. Environment Variables

Create `.env` in `apps/server`:

```env
PORT=3001
CORS_ORIGIN=http://localhost:3000,https://hamster-coup.yourdomain.com
DATABASE_URL=postgresql://postgres:password@localhost:5432/hamster_coup?schema=public
NODE_ENV=production
```

Create `.env` in `apps/web`:

```env
VITE_API_URL=https://api.hamster-coup.yourdomain.com
```

---

## 3. Local Development Commands

```bash
# 1. Install all monorepo dependencies
npm install

# 2. Run automated test suite
npm run test

# 3. Build all packages
npm run build

# 4. Start backend server
npm run dev:server

# 5. Start frontend web client
npm run dev:web
```

---

## 4. Docker Deployment

### `Dockerfile.server`
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/
RUN npm install
RUN npm run build --workspace=@hamster-coup/server

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 3001
CMD ["npm", "run", "start", "--workspace=@hamster-coup/server"]
```

### `Dockerfile.web`
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
RUN npm install
RUN npm run build --workspace=@hamster-coup/web

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 5. Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name hamster-coup.yourdomain.com;

    # Static Web App
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API & WebSocket Proxy
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
