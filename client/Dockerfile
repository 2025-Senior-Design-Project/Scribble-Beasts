FROM node:20-alpine AS base
WORKDIR /app

# Copy root package files (needed for npm ci with workspaces)
COPY package.json package-lock.json ./

# Copy workspace package files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies using clean install
# This installs all dependencies for the workspace and is faster/more reliable than npm install
RUN npm ci

# Copy shared source code
COPY shared/ ./shared/

# Copy client source code and config
COPY client/ ./client/

FROM base AS development
WORKDIR /app/client
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
WORKDIR /app/client
# Build client
# Pass VITE_SERVER_URL as build arg
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
RUN npm run build

FROM nginx:alpine AS production
# Copy build output from builder stage
COPY --from=builder /app/client/dist /usr/share/nginx/html
# Copy nginx config template
COPY --from=builder /app/client/nginx.conf.template /etc/nginx/templates/default.conf.template

# Default DNS resolver (local/docker), overridden in fly.toml
ENV DNS_RESOLVER=127.0.0.11
# Helper for nginx variable escaping in templates
ENV DOLLAR=$
ENV PORT=80

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
