FROM node:20-alpine AS base
WORKDIR /app

# Copy root package.json and workspace configuration
COPY package*.json ./

# Copy server package.json and config
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/

# Copy shared package
COPY shared/ ./shared/

# Install dependencies for the workspace
RUN npm install

# Copy source code
COPY server/src ./server/src

FROM base AS development
WORKDIR /app/server
EXPOSE 5001
CMD ["npm", "run", "dev"]

FROM base AS builder
WORKDIR /app
# Build server and shared dependencies
RUN npm run build:server

FROM node:20-alpine AS production
WORKDIR /app

# Copy server package.json
COPY --from=builder /app/server/package*.json ./

# Install production dependencies directly
RUN npm install --omit=dev

# Copy built artifacts
COPY --from=builder /app/server/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

# The start command needs to point to the correct file in dist
CMD ["node", "dist/server/src/index.js"]
