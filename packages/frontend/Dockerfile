# Stage 1: Build
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/frontend/package.json packages/frontend/
RUN yarn install --immutable
COPY tsconfig.base.json ./
COPY packages/frontend packages/frontend
RUN yarn workspace frontend build

# Stage 2: Serve
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
