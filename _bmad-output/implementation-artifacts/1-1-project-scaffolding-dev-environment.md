# Story 1.1: Project Scaffolding & Dev Environment

Status: ready-for-dev

## Story

As a **developer**,
I want a fully configured monorepo with frontend and backend packages,
so that I can start building features with a consistent, working dev environment.

## Acceptance Criteria

1. **Given** a fresh checkout of the repository **When** I run `yarn install` **Then** all dependencies install without errors across both workspaces

2. **Given** the project is initialized **When** I inspect the directory structure **Then** it contains `packages/frontend` (Vite React-TS) and `packages/backend` (Fastify TypeScript) workspaces with a root `package.json` declaring `"workspaces": ["packages/*"]`

3. **Given** both packages are set up **When** I run `yarn workspace backend dev` **Then** the Fastify server starts on port 3000 using `tsx watch`

4. **Given** both packages are set up **When** I run `yarn workspace frontend dev` **Then** the Vite dev server starts with HMR enabled

5. **Given** the frontend dev server is running **When** a request is made to `/api/*` **Then** it is proxied to `localhost:3000` (Vite dev proxy configured)

6. **Given** the project root **When** I inspect shared configs **Then** `tsconfig.base.json` exists with strict mode and both packages extend it, and a shared ESLint config is present

7. **Given** the project root **When** I check `.gitignore` **Then** it excludes `node_modules`, `dist`, build artifacts, and IDE files

## Tasks / Subtasks

- [ ] Task 1: Initialize Yarn workspaces monorepo (AC: #1, #2)
  - [ ] Create root `package.json` with `"workspaces": ["packages/*"]`
  - [ ] Set `"private": true` and `"packageManager"` field for Yarn via corepack
  - [ ] Create `packages/frontend/` and `packages/backend/` directories
- [ ] Task 2: Scaffold frontend package (AC: #4)
  - [ ] Run `yarn create vite packages/frontend --template react-ts` (or equivalent manual setup)
  - [ ] Verify Vite 8 with react-ts template
  - [ ] Add Chakra UI v3 (`@chakra-ui/react@3.34.0`) and `@emotion/react` dependencies
  - [ ] Add TanStack Query (`@tanstack/react-query`) dependency
  - [ ] Configure `vite.config.ts` with `/api` proxy to `localhost:3000` (AC: #5)
- [ ] Task 3: Scaffold backend package (AC: #3)
  - [ ] Create `packages/backend/package.json` with name, scripts (`dev`, `build`, `start`, `test`)
  - [ ] Add runtime deps: `fastify`, `@fastify/cors`, `@fastify/helmet`, `@fastify/sensible`
  - [ ] Add dev deps: `typescript`, `@types/node`, `tsx`, `vitest`
  - [ ] Create minimal `src/index.ts` entry point that starts Fastify on port 3000
  - [ ] Create `src/server.ts` with Fastify instance creation and plugin registration
  - [ ] Configure `dev` script: `tsx watch src/index.ts`
- [ ] Task 4: Shared TypeScript configuration (AC: #6)
  - [ ] Create root `tsconfig.base.json` with strict mode, ES2022 target, Node22 compatible settings
  - [ ] Create `packages/frontend/tsconfig.json` extending `../../tsconfig.base.json`
  - [ ] Create `packages/backend/tsconfig.json` extending `../../tsconfig.base.json` with `outDir: "dist"`
- [ ] Task 5: Shared ESLint configuration (AC: #6)
  - [ ] Create root `.eslintrc.cjs` with TypeScript + React rules
  - [ ] Both packages inherit root config
- [ ] Task 6: Create `.gitignore` (AC: #7)
  - [ ] Exclude: `node_modules/`, `dist/`, `.vite/`, `*.tsbuildinfo`, `.idea/`, `.vscode/`, `.DS_Store`, `coverage/`
- [ ] Task 7: Vitest configuration for both packages
  - [ ] Create `packages/frontend/vitest.config.ts` (jsdom environment, React testing)
  - [ ] Create `packages/backend/vitest.config.ts` (node environment)
- [ ] Task 8: Verify full dev workflow
  - [ ] `yarn install` succeeds with no errors
  - [ ] `yarn workspace backend dev` starts Fastify on port 3000
  - [ ] `yarn workspace frontend dev` starts Vite dev server
  - [ ] Frontend `/api/*` proxy forwards to backend

## Dev Notes

### Critical Architecture Constraints

**Runtime:** Node.js 22 (available in environment)

**Package Manager:** Yarn (via corepack). Use `yarn init -w` or manually create root package.json with workspaces field. Do NOT use npm or pnpm.

**TypeScript:** Strict mode is mandatory across both packages. Both must extend a shared `tsconfig.base.json` at root.

**Framework Versions (pinned in architecture):**
- Vite 8.0.10 (uses Rolldown bundler)
- Fastify 5.8
- Chakra UI v3 (3.34.0) with `@emotion/react`
- TanStack Query (latest stable)
- Vitest 4.1.5
- tsx (latest stable) for backend dev server

### Backend Minimal Setup

The backend needs a working Fastify server to verify the dev workflow. Create:
- `src/index.ts` — entry point, imports server and calls `listen({ port: 3000, host: '0.0.0.0' })`
- `src/server.ts` — creates Fastify instance, registers `@fastify/cors`, `@fastify/helmet`, `@fastify/sensible`

This is a minimal "hello world" level setup. Full routes and store come in Story 1.2.

### Frontend Minimal Setup

After Vite scaffolding, the default React template app is sufficient. The key additions for this story:
- Install Chakra UI and TanStack Query dependencies (actual theme/providers come in Story 1.3)
- Configure Vite proxy in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### Vite Proxy Configuration

The proxy is critical for local dev. Frontend runs on port 5173 (Vite default), backend on 3000. All `/api/*` requests from the frontend must proxy to the backend. This is configured in `vite.config.ts`, NOT via CORS or any other mechanism.

### ESLint Configuration

Use `.eslintrc.cjs` (CommonJS) at root. Architecture specifies a shared config, not per-package configs. Include TypeScript parser and React plugin rules.

### Naming Conventions (enforced project-wide)

- **React components:** PascalCase files and names (e.g., `TaskItem.tsx`)
- **Everything else:** camelCase (e.g., `taskStore.ts`, `useTasks.ts`)
- **Test files:** Co-located `*.test.ts(x)` next to source
- **Config files:** lowercase with dots (e.g., `tsconfig.json`)
- **No barrel files** (`index.ts` re-exports) — use direct imports
- **No path aliases** (`@/`) — relative imports only

### Project Structure Notes

Target directory structure for this story:

```
bmad/
├── package.json                    # { "workspaces": ["packages/*"], "private": true }
├── .gitignore
├── .eslintrc.cjs                   # Shared ESLint config
├── tsconfig.base.json              # Shared TypeScript strict config
└── packages/
    ├── frontend/
    │   ├── package.json
    │   ├── tsconfig.json           # extends ../../tsconfig.base.json
    │   ├── vite.config.ts          # includes /api proxy
    │   ├── vitest.config.ts
    │   ├── index.html
    │   ├── public/
    │   └── src/
    │       ├── main.tsx
    │       ├── App.tsx
    │       └── ... (Vite template defaults)
    └── backend/
        ├── package.json
        ├── tsconfig.json           # extends ../../tsconfig.base.json
        ├── vitest.config.ts
        └── src/
            ├── index.ts            # entry point — starts server
            └── server.ts           # Fastify instance + plugin registration
```

Do NOT create any files beyond this scope. Stories 1.2-1.6 add routes, store, components, theme, etc.

### Anti-Patterns to Avoid

- Do NOT use `npm` or `pnpm` — this project uses Yarn workspaces
- Do NOT install `axios` — project uses plain `fetch` (Story 1.4+)
- Do NOT create `index.ts` barrel files
- Do NOT use path aliases like `@/` in tsconfig
- Do NOT add `jest` — this project uses Vitest exclusively
- Do NOT create a shared package for types — Task type is duplicated intentionally (architecture decision)
- Do NOT add React Router — single view, no routing needed
- Do NOT create Docker files yet — that's Epic 5
- Do NOT create Playwright config yet — that's Epic 4

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md — Development Workflow Integration]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.1]
- [Source: _bmad-output/planning-artifacts/prd.md — Technical Requirements]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
