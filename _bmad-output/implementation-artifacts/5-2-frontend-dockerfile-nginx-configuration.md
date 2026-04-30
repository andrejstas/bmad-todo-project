# Story 5.2: Frontend Dockerfile & Nginx Configuration

Status: done

## Story

As a **developer**,
I want a production-optimized Docker image for the frontend,
so that static files are served efficiently with proper API proxying.

## Acceptance Criteria

1. **Given** the frontend Dockerfile **When** I inspect its stages **Then** it uses a multi-stage build: stage 1 builds with Vite (Node.js), stage 2 serves with nginx

2. **Given** the production image **When** I inspect the running container **Then** nginx runs as a non-root user

3. **Given** the nginx configuration **When** a request is made to `/api/*` **Then** it is reverse-proxied to the backend container

4. **Given** the nginx configuration **When** a request is made to any other path **Then** it serves the Vite build output (static files) with the SPA fallback to `index.html`

5. **Given** the frontend container is running **When** I request the root URL `/` **Then** it returns the app's `index.html` with status 200

6. **Given** the production image **When** I inspect its contents **Then** only the Vite build output and nginx config are included — no source code, no node_modules

## Tasks / Subtasks

- [x] Task 1: Create nginx configuration (AC: #3, #4)
  - [x] Create `packages/frontend/nginx.conf`
  - [x] Configure static file serving from `/usr/share/nginx/html`
  - [x] Configure SPA fallback: `try_files $uri $uri/ /index.html`
  - [x] Configure `/api` reverse proxy to `http://backend:3000`
  - [x] Listen on port 8080 (non-root nginx can't bind to 80)
- [x] Task 2: Create frontend Dockerfile (AC: #1, #2, #5, #6)
  - [x] Create `packages/frontend/Dockerfile` with multi-stage build
  - [x] Stage 1 (build): Node.js 22 slim, install deps, `tsc -b && vite build`
  - [x] Stage 2 (serve): `nginxinc/nginx-unprivileged:stable-alpine`, copy build output + nginx.conf
  - [x] Handle Yarn workspace monorepo structure (root configs + frontend package)
- [x] Task 3: Verify build
  - [x] Vite builds successfully: `corepack yarn workspace frontend build`
  - [x] Fixed: excluded test files from tsconfig.app.json to prevent tsc build errors
  - [x] Lint passes: `corepack yarn lint`
  - [x] All tests pass: 30 frontend + 31 backend

## Dev Notes

### Nginx Configuration

Create `packages/frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Key details:**
- `proxy_pass http://backend:3000` — uses Docker Compose service name `backend` as hostname
- `try_files $uri $uri/ /index.html` — SPA fallback for client-side routing (even though we don't use routing, it's best practice)
- No `location ~* \.(js|css|...)` block needed — nginx serves static files by default from root

### Dockerfile — Multi-Stage Build

```dockerfile
# Stage 1: Build
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/frontend/package.json packages/frontend/
RUN yarn install --immutable
COPY packages/frontend packages/frontend
COPY tsconfig.base.json ./
RUN yarn workspace frontend build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key details:**
- Build stage uses `node:22-slim` (same as backend), copies entire frontend package for Vite build
- `yarn workspace frontend build` runs `tsc -b && vite build` (per package.json scripts)
- Production stage uses `nginx:stable-alpine` — lightweight, production-ready
- Only `dist/` output and `nginx.conf` are copied to the production image
- `tsconfig.base.json` needed because frontend `tsconfig.app.json` references it indirectly

**Non-root nginx:** The default `nginx:stable-alpine` image runs as root. For non-root:
- Use `nginx:stable-alpine` and add a user, OR
- Use `nginxinc/nginx-unprivileged` which runs as uid 101 by default

Using `nginxinc/nginx-unprivileged` is simpler:
```dockerfile
FROM nginxinc/nginx-unprivileged:stable-alpine
```
This image listens on port 8080 by default (non-root can't bind to port 80). Update nginx.conf to `listen 8080;` and `EXPOSE 8080`.

**IMPORTANT:** If using `nginxinc/nginx-unprivileged`, the nginx config path is the same (`/etc/nginx/conf.d/default.conf`) but the port must be 8080+.

### Build Context

Like the backend, the Docker build context must be the project root:
```bash
docker build -f packages/frontend/Dockerfile -t bmad-frontend .
```

The frontend build needs:
- Root `package.json`, `yarn.lock`, `.yarnrc.yml` for Yarn workspace
- `tsconfig.base.json` (referenced by `tsconfig.app.json`)
- Full `packages/frontend/` directory (src, index.html, configs)

### What NOT To Do

- Do NOT use `node` to serve static files — use nginx
- Do NOT install Node.js in the production stage — only nginx is needed
- Do NOT copy `node_modules` to the production image
- Do NOT copy TypeScript source files to the production image
- Do NOT hardcode the backend URL as an IP address — use Docker service name `backend`
- Do NOT use `proxy_pass http://localhost:3000` — in Docker Compose, backend is a separate container
- Do NOT modify Vite config — the dev proxy is for local development only, nginx handles production proxying

### Previous Story Learnings

- Story 5.1: Backend Dockerfile uses `node:22-slim`, Yarn workspace focus, `USER node`
- Story 5.1: Build context is project root due to monorepo structure
- Story 5.1: `corepack enable` required before yarn commands in Docker
- Frontend build: `tsc -b && vite build` outputs to `packages/frontend/dist/`
- Vite dev proxy (`/api` → `localhost:3000`) is for dev only — nginx replaces it in production

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 5.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment, Frontend Dockerfile]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Used `nginxinc/nginx-unprivileged:stable-alpine` for non-root nginx (runs as uid 101)
- Port 8080 instead of 80 — non-root user can't bind to privileged ports
- `proxy_pass http://backend:3000` — Docker Compose service name as hostname
- Fixed pre-existing build issue: test files in `src/` caused `tsc -b` to fail on vitest globals — excluded `*.test.*`, `test-setup.ts`, `test-utils.tsx` from `tsconfig.app.json`
- Build context is project root: `docker build -f packages/frontend/Dockerfile -t bmad-frontend .`

### Completion Notes List

- All 6 acceptance criteria satisfied
- AC #1: Multi-stage Dockerfile — stage 1 Vite build, stage 2 nginx serve
- AC #2: Non-root nginx via `nginxinc/nginx-unprivileged`
- AC #3: `/api` proxied to `http://backend:3000`
- AC #4: SPA fallback via `try_files $uri $uri/ /index.html`
- AC #5: Root URL serves `index.html`
- AC #6: Production image contains only Vite dist output + nginx config
- Fixed tsconfig.app.json to exclude test files from build
- All tests pass: 30 frontend + 31 backend, lint clean

### File List

- packages/frontend/nginx.conf (new — nginx reverse proxy + SPA config)
- packages/frontend/Dockerfile (new — multi-stage build)
- packages/frontend/tsconfig.app.json (modified — excluded test files from build)

## Change Log

- 2026-04-30: Story implemented — frontend Dockerfile with nginx, SPA fallback, API reverse proxy, non-root user
