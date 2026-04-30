# Stage 1: Build
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
RUN yarn install --immutable
COPY tsconfig.base.json ./
COPY packages/backend/src packages/backend/src
COPY packages/backend/tsconfig.json packages/backend/
RUN yarn workspace backend build

# Stage 2: Production
FROM node:22-slim
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
RUN yarn workspaces focus backend --production
COPY --from=build /app/packages/backend/dist packages/backend/dist
USER node
ENV PORT=3000 HOST=0.0.0.0
EXPOSE 3000
CMD ["node", "packages/backend/dist/index.js"]
