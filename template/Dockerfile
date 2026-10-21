FROM node:24-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 (enabled by the Alps module) may need to compile on the
# target architecture. Keep the toolchain in the build stage only.
RUN apt-get update \
  && apt-get install --yes --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
__ALPS_DOCKER_COPY__
COPY --from=build /app/.env.example ./.env.example
RUN mkdir -p /app/storage /app/var && chown -R node:node /app
USER node
EXPOSE __PORT__
CMD ["node","dist/server.js"]
