FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
COPY . .
RUN npm install
EXPOSE ${SERVER_PORT:-5000}
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY . .
RUN npm install
RUN npm run build

FROM node:16-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
EXPOSE ${SERVER_PORT:-5000}
CMD ["npm", "start"]
