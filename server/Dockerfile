FROM node:20-alpine AS base
WORKDIR /app

# Copy shared source code
# Needed by server tsconfig paths
COPY shared/ ./shared/

# Copy server package files
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy server source code
COPY server/src ./src

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

# Copy server package files for production install
COPY --from=builder /app/server/package*.json ./server/

# Install production dependencies
WORKDIR /app/server
RUN npm install --omit=dev

# Copy built artifacts
COPY --from=builder /app/server/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

# Start the server
# Note: dist/server/src/index.js path comes from tsc output structure
CMD ["node", "dist/server/src/index.js"]
