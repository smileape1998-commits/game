FROM node:22-alpine

WORKDIR /app

# Copy monorepo configuration and source code
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

# Install dependencies and build packages + frontend
RUN npm install
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start"]
