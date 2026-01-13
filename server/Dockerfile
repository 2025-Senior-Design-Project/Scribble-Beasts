FROM node:24-alpine AS base
ARG REPO_URL
LABEL org.opencontainers.image.source=$REPO_URL
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS development
EXPOSE ${SERVER_PORT:-5000}
CMD ["npm", "run", "dev"]

FROM base AS builder
CMD ["npm", "run", "build"]

FROM node:16-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE ${SERVER_PORT:-5000}
CMD ["npm", "start"]
