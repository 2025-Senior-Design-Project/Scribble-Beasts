FROM node:20-alpine AS base
WORKDIR /app

# Copy root package.json and workspace configuration
COPY package*.json ./

# Copy client package.json and config
COPY client/package*.json ./client/
COPY client/tsconfig*.json ./client/
COPY client/vite.config.ts ./client/
COPY client/index.html ./client/
COPY client/nginx.conf ./client/
COPY client/nginx.conf.template ./client/

# Copy shared package if needed (often clients consume shared types)
COPY shared/ ./shared/

# Install dependencies for the workspace
RUN npm install

# Copy source code
COPY client/src ./client/src
COPY client/public ./client/public

FROM base AS development
WORKDIR /app/client
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
WORKDIR /app
# Build client
# Pass VITE_SERVER_URL as build arg
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
RUN npm run build:client

FROM nginx:alpine AS production
# Copy build output from builder stage
COPY --from=builder /app/client/dist /usr/share/nginx/html
# Copy nginx config template
COPY --from=builder /app/client/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
