FROM node:20-alpine AS base
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies (using root lockfile)
RUN npm ci

# Copy shared source code
COPY shared/ ./shared/

# Copy server source code and config
COPY server/tsconfig.json ./server/
COPY server/src ./server/src

FROM base AS development
WORKDIR /app/server
EXPOSE 5001
CMD ["npm", "run", "dev"]

FROM base AS builder
WORKDIR /app/server
# Build server
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

# Copy package files for production install
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install production dependencies
RUN npm ci --omit=dev

# Setup workdir for server
WORKDIR /app/server

# Copy built artifacts
COPY --from=builder /app/server/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

# Start the server
# Note: dist/server/src/index.js path comes from tsc output structure which includes parent dirs due to shared code
CMD ["node", "dist/server/src/index.js"]
