FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY scripts ./scripts
COPY db ./db
EXPOSE 3000
HEALTHCHECK \
  --interval=5s \
  --timeout=3s \
  --start-period=20s \
  --retries=10 \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/app/server.js"]
