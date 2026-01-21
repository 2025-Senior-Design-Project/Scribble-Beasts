FROM node:20-alpine AS base
WORKDIR /app

# Copy shared source code
COPY shared/ ./shared/

# Copy client package files and config
COPY client/package*.json ./client/
COPY client/tsconfig*.json ./client/
COPY client/vite.config.ts ./client/
COPY client/index.html ./client/
COPY client/nginx.conf ./client/
COPY client/nginx.conf.template ./client/

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Copy client source code
COPY client/src ./src
COPY client/public ./public

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

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
