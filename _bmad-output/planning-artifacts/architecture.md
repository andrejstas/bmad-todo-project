---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
lastStep: 8
status: 'complete'
completedAt: '2026-04-29'
inputDocuments:
  - prd.md
  - ux-design-specification.md
workflowType: 'architecture'
project_name: 'bmad'
user_name: 'Andrej'
date: '2026-04-29'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
15 requirements spanning 5 categories:
- **Task Management (FR1-FR6):** Full CRUD — create, read, update (edit text + toggle completion), delete. Single flat list with open and completed items visible together.
- **Visual Feedback (FR7-FR8):** Visual distinction between task states; empty state handling.
- **Accessibility (FR9-FR11):** Keyboard-only operation, screen reader announcements for state changes, visible focus indicators on all interactive elements.
- **System Lifecycle (FR12-FR13):** Clean start on launch (empty list), health check endpoint for container orchestration.
- **API (FR14-FR15):** RESTful endpoints for all task operations with input validation and error responses.

**Non-Functional Requirements:**
- **Performance:** <1s first meaningful paint, <100ms API responses, <3s to first task added, <30s Docker Compose startup
- **Security:** Backend input validation/sanitization, no raw HTML rendering (XSS prevention), non-root Docker containers, no sensitive data stored
- **Accessibility:** WCAG AA compliance — zero critical violations, 4.5:1 contrast ratios, semantic HTML, ARIA live regions
- **Testing:** 70% meaningful code coverage, minimum 5 Playwright E2E tests, automated accessibility audits via axe-core

**Scale & Complexity:**

- Primary domain: Full-stack web application (React SPA + Fastify REST API)
- Complexity level: Low-medium — minimal domain complexity, significant quality infrastructure
- Estimated architectural components: ~8-10 (frontend components, API layer, in-memory store, Docker services, test suites)

### Technical Constraints & Dependencies

- **Frontend framework:** React SPA (specified in PRD)
- **Backend framework:** Fastify (specified in PRD)
- **Design system:** Chakra UI (specified in UX design spec)
- **Storage:** In-memory only — no database, state resets on restart
- **Communication:** RESTful HTTP request-response — no WebSockets, no polling
- **Deployment:** Docker Compose with multi-stage builds
- **Browser support:** Modern evergreen browsers only (Chrome, Firefox, Safari, Edge)
- **Single view:** No client-side routing required

### Cross-Cutting Concerns Identified

- **Accessibility:** Affects every UI component — keyboard navigation, ARIA attributes, focus management, screen reader announcements, contrast compliance
- **Input validation:** Backend sanitization for all user-provided text; frontend should not trust or render raw input
- **Testing strategy:** Three tiers (unit, integration, E2E) spanning both frontend and backend — test infrastructure is a first-class architectural concern
- **Containerization:** Both frontend and backend need Dockerfiles with multi-stage builds, health checks, non-root users, and Docker Compose orchestration
- **Error handling:** API-first means every UI action depends on an HTTP round-trip — consistent error handling and optimistic UI rollback patterns needed

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application — React SPA frontend + Fastify REST API backend, deployed as separate Docker containers via Docker Compose.

### Starter Options Considered

**Frontend:**
- `yarn create vite` (react-ts template) — **Selected.** Standard, minimal, fast. Vite 8 with Rolldown bundler.
- Create React App — Deprecated, not considered.
- Next.js — Overkill for a single-view SPA with no SSR needs.

**Backend:**
- `fastify-cli generate` — Evaluated. Limited TypeScript scaffolding, adds unnecessary plugin structure for a 4-route API.
- Manual Fastify + TypeScript setup — **Selected.** Cleaner for a minimal API, full control over structure.
- Express — Not considered; Fastify specified in PRD.

**Project Structure:**
- Yarn workspaces monorepo — **Selected.** Shared config, unified scripts, clean Docker mapping.
- Separate repositories — Rejected; unnecessary overhead for a solo developer.
- Single flat project — Rejected; muddies the frontend/backend separation needed for Docker.

### Selected Approach: Yarn Workspaces Monorepo + Vite + Manual Fastify

**Rationale:**
- Vite is the standard React scaffolding tool — fast, minimal, well-maintained
- Manual Fastify setup avoids generator bloat for a simple API
- Yarn workspaces provide shared configuration without monorepo tool complexity
- Structure maps directly to Docker Compose services

**Initialization Commands:**

```bash
# Root workspace setup
mkdir bmad && cd bmad
yarn init -w

# Frontend package
yarn create vite packages/frontend --template react-ts

# Backend package (manual)
mkdir -p packages/backend && cd packages/backend
yarn init
yarn add fastify @fastify/cors @fastify/sensible
yarn add -D typescript @types/node tsx vitest
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript across both packages (strict mode)
- Node.js 22 runtime (matches environment)

**Styling Solution:**
- Chakra UI v3 (3.34.0) with @emotion/react — added to frontend after scaffolding

**Build Tooling:**
- Vite 8.0.10 with Rolldown for frontend builds
- `tsx` for backend development, `tsc` for backend production builds

**Testing Framework:**
- Vitest 4.1.5 for unit and integration tests (both packages)
- Playwright for E2E tests (root level, spans both services)

**Code Organization:**
- Yarn workspaces monorepo (`packages/frontend`, `packages/backend`)
- Shared root-level config (TypeScript base, ESLint, Playwright)
- Each package has its own Dockerfile

**Development Experience:**
- Vite HMR for frontend hot reload
- `tsx watch` for backend auto-restart
- Unified yarn scripts from root (`yarn workspace frontend dev`, etc.)
- ESLint for code quality

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data validation: Fastify built-in JSON Schema validation
- API design: RESTful with /api prefix, PATCH for partial updates
- Frontend state: TanStack Query for server state management
- Docker serving: nginx for frontend static files with API proxy

**Important Decisions (Shape Architecture):**
- ID generation: crypto.randomUUID() (Node.js built-in)
- In-memory store: Map<string, Task> for O(1) lookups
- Security headers: @fastify/helmet
- Error format: Fastify default via @fastify/sensible

**Deferred Decisions (Post-MVP):**
- None — all decisions needed for single release are made

### Data Architecture

- **Storage:** In-memory `Map<string, Task>` — O(1) lookups by ID, easy iteration for list retrieval
- **Task ID generation:** `crypto.randomUUID()` — built into Node.js 22, zero dependencies
- **Validation:** Fastify's built-in JSON Schema validation (Ajv) — zero-dependency, schemas double as API documentation
- **Task shape:** `{ id: string, text: string, completed: boolean, createdAt: string }`

### Authentication & Security

- **Authentication:** None — no accounts, no signup, no sessions (by design)
- **Input sanitization:** Trim whitespace, enforce max length (500 chars) at API level. React's default JSX escaping prevents XSS — no `dangerouslySetInnerHTML` usage
- **CORS:** `@fastify/cors` configured to allow frontend origin only
- **Security headers:** `@fastify/helmet` for standard headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **No sensitive data:** No auth tokens, no PII, no cookies stored

### API & Communication Patterns

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks | List all tasks |
| POST | /api/tasks | Create a task |
| PATCH | /api/tasks/:id | Update task (text and/or completion) |
| DELETE | /api/tasks/:id | Delete a task |
| GET | /health | Health check |

- **PATCH over PUT:** Updates are partial — text or completion can change independently
- **Error format:** Fastify default `{ statusCode, error, message }` via @fastify/sensible
- **API documentation:** README only — 4 endpoints don't warrant Swagger/OpenAPI overhead

### Frontend Architecture

- **State management:** TanStack Query — handles fetching, caching, optimistic updates, and error rollback natively
- **API client:** Plain `fetch` with thin helper (base URL + JSON headers) — no axios dependency
- **Component structure:** Flat organization matching UX spec components:
  - `components/` — TaskInput, TaskItem, TaskList, ProgressCounter
  - `api/` — fetch helpers + TanStack Query hooks
  - `theme/` — Chakra UI custom theme tokens
- **No client-side routing:** Single view, single page

### Infrastructure & Deployment

- **Frontend serving:** nginx in Docker — serves Vite build output as static files, proxies `/api` to backend
- **API routing:** nginx reverse proxy — frontend uses relative paths (`/api/tasks`), no build-time API URL needed
- **Docker network:** Single Docker Compose network, internal communication between containers
- **Environment variables:**
  - `PORT` — backend port (default 3000)
  - `HOST` — backend host (default 0.0.0.0)
  - `CORS_ORIGIN` — allowed frontend origin
- **Health checks:**
  - Backend: `GET /health` → `{ "status": "ok" }`
  - Frontend: nginx root URL returns 200

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (yarn workspaces, packages)
2. Backend: Fastify server, in-memory store, REST endpoints, validation, health check
3. Frontend: React + Chakra UI setup, theme, components, TanStack Query integration
4. Docker: Dockerfiles (multi-stage), nginx config, docker-compose.yml
5. Testing: Vitest suites (unit + integration), Playwright E2E + axe-core
6. Polish: Accessibility audit, security review, README

**Cross-Component Dependencies:**
- Frontend TanStack Query hooks depend on backend API contract (endpoint shapes, error format)
- nginx proxy config depends on backend port and route prefix (`/api`)
- Docker Compose health checks depend on backend `/health` endpoint
- E2E tests depend on both services running (Docker Compose or local dev)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 areas where AI agents could make different choices, grouped into naming, structure, format, and process patterns.

### Naming Patterns

**File Naming Conventions:**
- React component files: `PascalCase.tsx` — e.g., `TaskItem.tsx`, `ProgressCounter.tsx`
- Non-component files (hooks, utils, API): `camelCase.ts` — e.g., `useTasks.ts`, `tasks.ts`
- Test files: Co-located `*.test.ts(x)` — e.g., `TaskItem.test.tsx` next to `TaskItem.tsx`
- Config files: lowercase with dots — e.g., `tsconfig.json`, `vite.config.ts`

**Code Naming Conventions:**
- Variables and functions: `camelCase` — `taskId`, `getTasks`, `isCompleted`
- React components: `PascalCase` — `TaskItem`, `TaskList`, `ProgressCounter`
- Types and interfaces: `PascalCase` — `Task`, `CreateTaskRequest`
- Constants: `camelCase` for app constants, `UPPER_SNAKE_CASE` only for true environment constants
- No prefixes on interfaces (no `ITask`) or types (no `TTask`)

**API Naming Conventions:**
- Endpoints: plural nouns — `/api/tasks`, `/api/tasks/:id`
- JSON fields: `camelCase` — `{ id, text, completed, createdAt }`
- Query parameters: `camelCase` (if ever needed)
- Route parameters: `:id` format (Fastify convention)

### Structure Patterns

**Test Co-location:**
```
components/
├── TaskItem.tsx
├── TaskItem.test.tsx
├── TaskList.tsx
└── TaskList.test.tsx
api/
├── tasks.ts
└── tasks.test.ts
```

**Backend Organization:**
```
src/
├── routes/
│   └── tasks.ts          # route handlers
├── store/
│   └── taskStore.ts      # in-memory Map + operations
├── schemas/
│   └── taskSchemas.ts    # JSON Schema definitions
├── server.ts             # Fastify setup + plugin registration
└── index.ts              # entry point
```

**Import Rules:**
- Relative imports only — no path aliases (`@/`)
- No `index.ts` barrel files — use direct imports
- Group imports: external packages first, then local modules, separated by blank line

### Format Patterns

**API Response Formats:**
- Success responses: Direct data — `Task` object or `Task[]` array, no wrapper
- Error responses: Fastify default `{ statusCode, error, message }` — no custom wrapper
- Created responses: Return the created `Task` with HTTP 201
- Delete responses: HTTP 204 No Content, empty body

**Data Formats:**
- Dates: ISO 8601 strings via `new Date().toISOString()` — e.g., `"2026-04-29T12:00:00.000Z"`
- IDs: UUID v4 strings via `crypto.randomUUID()`
- Booleans: native `true`/`false` — never `1`/`0` or `"true"`/`"false"`
- Null handling: Omit optional fields rather than sending `null`

### Process Patterns

**Error Handling:**
- Backend: Use `fastify.httpErrors` from `@fastify/sensible` for explicit errors (e.g., `reply.notFound('Task not found')`). Let Fastify's built-in error handler manage response formatting.
- Frontend: TanStack Query `onError` callbacks handle rollback. No toast notifications, no error banners — silent rollback per UX spec. The UI state is the feedback.
- Never throw raw `Error` objects in route handlers — always use Fastify's typed HTTP errors.

**Optimistic Update Pattern (all mutations):**
```typescript
// Pattern for all TanStack Query mutations:
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['tasks'] })
  const previous = queryClient.getQueryData(['tasks'])
  queryClient.setQueryData(['tasks'], optimisticUpdate)
  return { previous }
},
onError: (err, newData, context) => {
  queryClient.setQueryData(['tasks'], context.previous)
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['tasks'] })
}
```

**Loading States:**
- No loading spinners or skeleton screens (per UX spec — backend is near-instant)
- Empty state is the only visual "loading" — brief flash before first fetch resolves
- TanStack Query's `isLoading`/`isPending` available but not rendered in UI

### Enforcement Guidelines

**All AI Agents MUST:**
- Use PascalCase for component files and React component names
- Use camelCase for all other files, variables, functions, and JSON fields
- Co-locate test files next to source files with `.test.ts(x)` suffix
- Use Fastify's built-in error handling — never throw raw errors
- Follow the optimistic update pattern (onMutate → onError rollback → onSettled refetch) for all mutations
- Use relative imports — no path aliases, no barrel files

**Anti-Patterns to Avoid:**
- `snake_case` in JSON responses (e.g., `created_at`) — use `camelCase`
- Separate `__tests__/` directories — co-locate tests instead
- Custom error response wrappers — use Fastify defaults
- `axios` or other HTTP libraries — use plain `fetch`
- `index.ts` barrel files in component folders — use direct imports
- Interface prefixes (`ITask`) or type prefixes (`TTask`) — use plain names

## Project Structure & Boundaries

### Requirements to Structure Mapping

| FR Category | Location |
|---|---|
| Task Management (FR1-FR6) | `frontend/src/components/` + `backend/src/routes/tasks.ts` + `backend/src/store/taskStore.ts` |
| Visual Feedback (FR7-FR8) | `frontend/src/components/TaskItem.tsx`, `TaskList.tsx` |
| Accessibility (FR9-FR11) | Cross-cutting — all frontend components (ARIA, keyboard, focus) |
| System Lifecycle (FR12-FR13) | `backend/src/store/taskStore.ts` (empty init) + `backend/src/routes/health.ts` |
| API (FR14-FR15) | `backend/src/routes/tasks.ts` + `backend/src/schemas/taskSchemas.ts` |

### Complete Project Directory Structure

```
bmad/
├── package.json                    # Workspace root: { "workspaces": ["packages/*"] }
├── .gitignore
├── .eslintrc.cjs                   # Shared ESLint config (both packages extend)
├── tsconfig.base.json              # Shared TypeScript base config
├── docker-compose.yml              # Orchestrates frontend + backend containers
├── playwright.config.ts            # E2E test config (spans both services)
├── README.md                       # Setup instructions, API docs, project overview
│
├── e2e/                            # Playwright E2E tests
│   ├── tasks.spec.ts               # Task CRUD user journey tests
│   └── accessibility.spec.ts       # axe-core WCAG AA audit tests
│
├── packages/
│   ├── frontend/
│   │   ├── package.json
│   │   ├── tsconfig.json           # Extends ../../tsconfig.base.json
│   │   ├── vite.config.ts          # Dev server proxy: /api → localhost:3000
│   │   ├── vitest.config.ts
│   │   ├── index.html
│   │   ├── Dockerfile              # Multi-stage: build with Node, serve with nginx
│   │   ├── nginx.conf              # Static serving + /api reverse proxy
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   └── src/
│   │       ├── main.tsx            # App entry point: ChakraProvider + QueryClientProvider
│   │       ├── App.tsx             # Root component: card layout shell
│   │       ├── theme/
│   │       │   └── index.ts        # Chakra UI custom theme (colors, radii, shadows, fonts)
│   │       ├── api/
│   │       │   ├── client.ts       # Fetch helper (base URL, JSON headers, error handling)
│   │       │   ├── client.test.ts
│   │       │   ├── tasks.ts        # TanStack Query hooks: useTasksQuery, useCreateTask, etc.
│   │       │   └── tasks.test.ts
│   │       └── components/
│   │           ├── TaskInput.tsx
│   │           ├── TaskInput.test.tsx
│   │           ├── TaskItem.tsx
│   │           ├── TaskItem.test.tsx
│   │           ├── TaskList.tsx
│   │           ├── TaskList.test.tsx
│   │           ├── ProgressCounter.tsx
│   │           └── ProgressCounter.test.tsx
│   │
│   └── backend/
│       ├── package.json
│       ├── tsconfig.json            # Extends ../../tsconfig.base.json
│       ├── vitest.config.ts
│       ├── Dockerfile               # Multi-stage: build with tsc, run with Node (non-root)
│       └── src/
│           ├── index.ts             # Entry point: starts server
│           ├── server.ts            # Fastify instance setup, plugin registration, CORS, helmet
│           ├── server.test.ts       # Integration tests: full server with supertest/inject
│           ├── routes/
│           │   ├── tasks.ts         # CRUD route handlers + JSON Schema validation
│           │   ├── tasks.test.ts    # Route-level integration tests
│           │   ├── health.ts        # GET /health endpoint
│           │   └── health.test.ts
│           ├── store/
│           │   ├── taskStore.ts     # In-memory Map<string, Task>, CRUD operations
│           │   └── taskStore.test.ts
│           └── schemas/
│               └── taskSchemas.ts   # JSON Schema definitions for request/response validation
```

### Architectural Boundaries

**API Boundary:**
- The `/api` prefix is the single boundary between frontend and backend
- Frontend never accesses the store directly — all data flows through REST endpoints
- nginx proxies `/api/*` to the backend container — frontend uses relative paths only

**Component Boundaries:**
- `TaskList` owns the list layout and section separation (active/completed)
- `TaskItem` owns individual task rendering and inline edit state
- `TaskInput` owns new task creation — self-contained input + submit
- `ProgressCounter` is read-only — receives count via TanStack Query cache
- No component-to-component communication — all state flows through TanStack Query

**Data Flow:**
```
User Action → Component → TanStack Query Mutation → fetch → Fastify Route → taskStore (Map)
                                    ↓ (optimistic)
                              Query Cache Update → Components re-render
```

### Development Workflow Integration

**Local development (two terminals):**
```bash
yarn workspace backend dev     # tsx watch → localhost:3000
yarn workspace frontend dev    # vite dev → localhost:5173 (proxies /api to :3000)
```

**Docker (production-like):**
```bash
docker-compose up              # nginx:80 → frontend + proxies /api → backend:3000
```

**Testing:**
```bash
yarn workspace backend test    # Vitest — store + route tests
yarn workspace frontend test   # Vitest — component + hook tests
yarn test:e2e                  # Playwright — full stack E2E + accessibility
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible — React 19 + Vite 8, Fastify 5.8, Chakra UI v3, TanStack Query, Vitest 4.1, Playwright. No version conflicts. Yarn workspaces + Docker Compose structure aligns cleanly.

**Pattern Consistency:**
Naming conventions (camelCase/PascalCase), co-located tests, relative imports, and Fastify error handling patterns all align with React and Fastify ecosystem conventions. No contradictions between patterns.

**Structure Alignment:**
Monorepo packages map 1:1 to Docker Compose services. E2E tests at root span both services. nginx proxy config in frontend package handles API routing. All boundaries are consistent with the chosen patterns.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 15 FRs are architecturally supported:
- FR1-FR6 (Task CRUD): Components → TanStack Query hooks → fetch → REST endpoints → in-memory taskStore
- FR7-FR8 (Visual feedback): Chakra UI component states (completed strikethrough/fade, empty state)
- FR9-FR11 (Accessibility): Chakra UI WCAG AA defaults + custom ARIA live regions + keyboard handlers
- FR12-FR13 (System lifecycle): taskStore initializes as empty Map + GET /health endpoint
- FR14-FR15 (API): RESTful routes with JSON Schema validation via Fastify built-in Ajv

**Non-Functional Requirements Coverage:**
- Performance: Vite 8 (Rolldown) for fast builds, in-memory store for <100ms API responses ✅
- Security: @fastify/helmet, @fastify/cors, input sanitization (trim + max length), React JSX escaping, non-root Docker ✅
- Accessibility: Chakra UI WCAG AA, axe-core Playwright audits, keyboard navigation, ARIA live regions ✅
- Testing: Vitest (unit + integration), Playwright (E2E + accessibility), 70% coverage target ✅

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions documented with verified versions. No deferred decisions — single release scope is fully specified.

**Structure Completeness:**
Complete file tree with annotations. Every file has a clear purpose. Requirements mapped to specific files and directories.

**Pattern Completeness:**
Naming, format, process, and enforcement patterns cover all identified conflict points. Optimistic update pattern provided as concrete TypeScript example.

### Gap Analysis Results

**Resolved during validation:**
- **Shared Task type:** Duplicated in both packages — one interface, not worth a shared package
- **Vite dev proxy:** Added to vite.config.ts — proxies /api to localhost:3000 during local development
- **CORS scope clarified:** Needed for local dev (different ports); not needed in Docker (nginx same-origin proxy)

**No critical or important gaps remaining.**

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (low-medium)
- [x] Technical constraints identified (React, Fastify, Chakra UI, in-memory, Docker)
- [x] Cross-cutting concerns mapped (accessibility, validation, testing, containerization, error handling)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined (REST, TanStack Query, nginx proxy)
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established (PascalCase components, camelCase everything else)
- [x] Structure patterns defined (co-located tests, flat components, relative imports)
- [x] Format patterns specified (direct API responses, ISO dates, camelCase JSON)
- [x] Process patterns documented (optimistic updates, silent error rollback, Fastify error handling)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — simple domain, well-understood stack, all decisions made, no gaps remaining

**Key Strengths:**
- Every architectural decision directly traceable to a PRD or UX spec requirement
- Zero deferred decisions — complete specification for single release
- Concrete patterns with examples prevent AI agent divergence
- Technology choices are mainstream and well-documented — minimal risk

**Areas for Future Enhancement:**
- Dark mode support (Chakra useColorModeValue is available but out of scope)
- Persistent storage (swap taskStore Map for a database if needed later)
- API documentation (Swagger/OpenAPI if the API grows beyond 4 endpoints)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Duplicate the Task type in both packages — do not create a shared package
- Refer to this document for all architectural questions

**First Implementation Priority:**
Project scaffolding — yarn workspaces, Vite frontend, manual Fastify backend, shared configs (tsconfig.base.json, .eslintrc.cjs, .gitignore)
