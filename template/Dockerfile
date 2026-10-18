FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run check

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
__ALPS_DOCKER_COPY__
COPY --from=build /app/.env.example ./.env.example
RUN mkdir -p /app/storage && chown -R node:node /app
USER node
EXPOSE __PORT__
CMD ["node","dist/server.js"]
