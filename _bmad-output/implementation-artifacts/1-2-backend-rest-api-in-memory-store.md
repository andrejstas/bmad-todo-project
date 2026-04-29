# Story 1.2: Backend REST API with In-Memory Store

Status: done

## Story

As a **user**,
I want a REST API that manages my tasks,
so that my task data is created, retrieved, updated, and deleted reliably.

## Acceptance Criteria

1. **Given** the server is running **When** I `GET /api/tasks` **Then** I receive an empty array `[]` with status 200

2. **Given** the server is running **When** I `POST /api/tasks` with `{ "text": "Buy milk" }` **Then** I receive the created task `{ id, text, completed: false, createdAt }` with status 201

3. **Given** a task exists **When** I `PATCH /api/tasks/:id` with `{ "completed": true }` **Then** the task is updated and returned with status 200

4. **Given** a task exists **When** I `PATCH /api/tasks/:id` with `{ "text": "Updated text" }` **Then** the task text is updated and returned with status 200

5. **Given** a task exists **When** I `DELETE /api/tasks/:id` **Then** the task is removed and I receive status 204 with no body

6. **Given** no task exists with that ID **When** I `PATCH` or `DELETE /api/tasks/:id` **Then** I receive status 404 with `{ statusCode: 404, error: "Not Found", message: "Task not found" }`

7. **Given** I `POST /api/tasks` with empty text, missing text, or text exceeding 500 characters **When** the request is processed **Then** I receive status 400 with a JSON Schema validation error

8. **Given** the server is running **When** I `GET /health` **Then** I receive `{ "status": "ok" }` with status 200

9. **Given** the server restarts **When** I `GET /api/tasks` **Then** the list is empty (in-memory storage, no persistence between restarts)

10. **Given** the server is configured **When** I check registered plugins **Then** `@fastify/cors`, `@fastify/helmet`, and `@fastify/sensible` are loaded

## Tasks / Subtasks

- [x] Task 1: Create Task type and in-memory store (AC: #1, #9)
  - [x] Create `src/store/taskStore.ts` with `Map<string, Task>` and CRUD operations
  - [x] Define `Task` interface: `{ id: string, text: string, completed: boolean, createdAt: string }`
  - [x] Implement: `getAllTasks()`, `getTask(id)`, `createTask(text)`, `updateTask(id, updates)`, `deleteTask(id)`
  - [x] Use `crypto.randomUUID()` for ID generation
  - [x] Use `new Date().toISOString()` for `createdAt`
  - [x] Write unit tests for all store operations in `src/store/taskStore.test.ts`
- [x] Task 2: Create JSON Schema definitions for validation (AC: #7)
  - [x] Create `src/schemas/taskSchemas.ts` with request/response schemas
  - [x] POST body schema: `text` required string, minLength 1, maxLength 500
  - [x] PATCH body schema: optional `text` (string, minLength 1, maxLength 500) and/or `completed` (boolean), at least one required
  - [x] Response schemas for task object and task array
- [x] Task 3: Create task routes with validation (AC: #1-7)
  - [x] Create `src/routes/tasks.ts` as a Fastify plugin
  - [x] `GET /api/tasks` — returns all tasks as array (AC: #1)
  - [x] `POST /api/tasks` — creates task, returns 201 (AC: #2)
  - [x] `PATCH /api/tasks/:id` — updates task, returns 200 (AC: #3, #4)
  - [x] `DELETE /api/tasks/:id` — deletes task, returns 204 (AC: #5)
  - [x] 404 handling for non-existent tasks using `fastify.httpErrors.notFound()` (AC: #6)
  - [x] JSON Schema validation on POST and PATCH bodies (AC: #7)
  - [x] Write integration tests using `fastify.inject()` in `src/routes/tasks.test.ts`
- [x] Task 4: Create health check route (AC: #8)
  - [x] Create `src/routes/health.ts` as a Fastify plugin
  - [x] `GET /health` — returns `{ "status": "ok" }` with 200
  - [x] Write test in `src/routes/health.test.ts`
- [x] Task 5: Register routes in server.ts (AC: #10)
  - [x] Update `src/server.ts` to import and register task routes and health route
  - [x] Ensure existing plugin registration (cors, helmet, sensible) is preserved
- [x] Task 6: Verify full API workflow
  - [x] All tests pass: `corepack yarn workspace backend test`
  - [x] Manual verification: server starts, CRUD operations work via curl
  - [x] Lint passes: `corepack yarn lint`

### Review Findings

- [x] [Review][Patch] Test files should close Fastify server in `afterAll` — FIXED [tasks.test.ts, health.test.ts]
- [x] [Review][Defer] `updateTask` mutates stored object in place — deferred, no practical impact for single-threaded in-memory API
- [x] [Review][Defer] Whitespace-only text passes backend validation — deferred, frontend handles empty display
- [x] [Review][Defer] Missing edge-case tests (additional properties, non-string text, non-JSON content-type) — deferred, schemas handle correctly

## Dev Notes

### Existing Code State (from Story 1.1)

**`packages/backend/src/server.ts`** — Current state:
```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'

export function buildServer() {
  const fastify = Fastify({ logger: true })
  fastify.register(cors)
  fastify.register(helmet)
  fastify.register(sensible)
  return fastify
}
```
**What changes:** Add route registration (task routes + health route). Preserve all existing plugin registrations.

**`packages/backend/src/index.ts`** — Current state: imports `buildServer` from `./server.js`, calls `listen({ port: 3000, host: '0.0.0.0' })`. **No changes needed.**

**`packages/backend/tsconfig.json`** — Uses `module: "nodenext"` and `moduleResolution: "nodenext"`. All imports MUST use `.js` extension for local files (e.g., `import { taskStore } from './store/taskStore.js'`).

### Architecture Constraints

**Data Model:**
```typescript
interface Task {
  id: string          // crypto.randomUUID()
  text: string        // 1-500 chars
  completed: boolean  // default: false
  createdAt: string   // ISO 8601 via new Date().toISOString()
}
```

**Storage:** In-memory `Map<string, Task>` with O(1) lookups. No persistence — data resets on restart.

**ID Generation:** `crypto.randomUUID()` — built-in Node.js 22, zero dependencies.

**Validation:** Fastify's built-in JSON Schema validation (Ajv). Define schemas in `src/schemas/taskSchemas.ts` and pass them to route options.

**Error Handling:**
- Use `fastify.httpErrors.notFound('Task not found')` from `@fastify/sensible` for 404s
- Let Fastify's built-in validation handle 400 errors — do NOT write custom validation logic
- Never throw raw `Error` objects in route handlers

**API Response Format:**
- Success: Direct data (Task object or Task[] array), no wrapper
- Error: Fastify default `{ statusCode, error, message }`
- Created: HTTP 201 with Task object
- Deleted: HTTP 204 with empty body
- PATCH: Return full updated Task object with 200

**Routes as Fastify Plugins:**
Register routes as Fastify plugins using `fastify.register()`. Each route file exports an async function:
```typescript
import type { FastifyInstance } from 'fastify'

export default async function taskRoutes(fastify: FastifyInstance) {
  fastify.get('/api/tasks', async () => { ... })
  // ...
}
```

### PATCH Semantics

PATCH accepts partial updates — `text` and/or `completed`. The JSON Schema should use `anyOf` or `minProperties: 1` to ensure at least one field is provided. Both fields are optional individually but at least one must be present.

### Testing Approach

**Unit tests** (`src/store/taskStore.test.ts`):
- Test all CRUD operations on the store directly
- Test edge cases: get/update/delete non-existent ID, create with UUID uniqueness

**Integration tests** (`src/routes/tasks.test.ts`, `src/routes/health.test.ts`):
- Use `fastify.inject()` — no HTTP server needed
- Call `buildServer()` in a `beforeEach`, call `server.ready()` before injecting
- Test all endpoints with valid and invalid inputs
- Test 404 for non-existent IDs
- Test 400 for invalid POST/PATCH bodies (empty text, missing text, text > 500 chars)

**Important:** Always `await server.ready()` before calling `server.inject()` — this was flagged in Story 1.1 code review as a common Fastify testing footgun.

### File Structure for This Story

New files to create inside `packages/backend/`:
```
src/
├── routes/
│   ├── tasks.ts          # CRUD route handlers with JSON Schema validation
│   ├── tasks.test.ts     # Integration tests using fastify.inject()
│   ├── health.ts         # GET /health handler
│   └── health.test.ts    # Health endpoint test
├── store/
│   ├── taskStore.ts      # In-memory Map<string, Task> + operations
│   └── taskStore.test.ts # Unit tests for store
├── schemas/
│   └── taskSchemas.ts    # JSON Schema definitions for validation
├── server.ts             # UPDATE: register routes
└── index.ts              # No changes
```

### Naming & Import Conventions

- All file names: camelCase (e.g., `taskStore.ts`, `taskSchemas.ts`)
- All local imports: relative with `.js` extension (required by `moduleResolution: "nodenext"`)
  - Example: `import { taskStore } from '../store/taskStore.js'`
- Test files: co-located next to source (e.g., `tasks.test.ts` next to `tasks.ts`)
- No barrel files, no path aliases

### Deferred Items from Story 1.1 Review (relevant to this story)

- **CORS config:** Story 1.1 registered `@fastify/cors` with no options (allows all origins). This is acceptable for local dev. Do NOT change CORS config in this story — it will be properly configured in Epic 5 (Docker) with `CORS_ORIGIN` env var.

### Anti-Patterns to Avoid

- Do NOT install any new npm dependencies — everything needed is already installed
- Do NOT create custom error response wrappers — use Fastify defaults
- Do NOT use `try/catch` in route handlers for expected errors — use `fastify.httpErrors`
- Do NOT write validation logic manually — use Fastify JSON Schema validation
- Do NOT create an `index.ts` barrel file in routes/ or store/
- Do NOT use `snake_case` in JSON responses — use camelCase (`createdAt`, not `created_at`)
- Do NOT add `async/await` where not needed (store operations are synchronous)
- Do NOT trim or sanitize text in route handlers — validate via schema, React's JSX escaping handles XSS

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns: Error Handling]
- [Source: _bmad-output/planning-artifacts/architecture.md — Backend Organization]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.2]
- [Source: _bmad-output/planning-artifacts/prd.md — Functional Requirements FR13-FR15]
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffolding-dev-environment.md — Review Findings]

## Change Log

- 2026-04-29: Story implemented — full REST API with in-memory store, JSON Schema validation, health check, 27 passing tests

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Removed unused `getTask` import from tasks.ts (caught by ESLint `no-unused-vars`)
- Used `fastify.httpErrors.notFound()` from @fastify/sensible for 404 responses
- Used `minProperties: 1` on PATCH schema to enforce at least one field

### Completion Notes List

- All 10 acceptance criteria satisfied
- 14 unit tests for taskStore (CRUD, edge cases, UUID uniqueness, ISO dates)
- 12 integration tests for routes (all endpoints, validation errors, 404 handling)
- 1 health check test
- 27 total tests, all passing
- Lint clean, build clean
- All imports use `.js` extension per `moduleResolution: "nodenext"`

### File List

- packages/backend/src/store/taskStore.ts (new)
- packages/backend/src/store/taskStore.test.ts (new)
- packages/backend/src/schemas/taskSchemas.ts (new)
- packages/backend/src/routes/tasks.ts (new)
- packages/backend/src/routes/tasks.test.ts (new)
- packages/backend/src/routes/health.ts (new)
- packages/backend/src/routes/health.test.ts (new)
- packages/backend/src/server.ts (modified — added route registration)
