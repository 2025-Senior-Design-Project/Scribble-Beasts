FROM node:24-alpine AS base
ARG REPO_URL
LABEL org.opencontainers.image.source=$REPO_URL
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS development
EXPOSE ${CLIENT_PORT:-3000}
CMD ["npm", "run", "dev"]

FROM base AS builder
RUN npm install
CMD ["npm", "run", "build"]

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE ${CLIENT_PORT:-3000}
CMD ["nginx", "-g", "daemon off;"]
