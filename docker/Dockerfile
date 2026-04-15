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
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY .env.example ./.env.example
EXPOSE 3001
CMD ["node", "dist/src/server.js"]
