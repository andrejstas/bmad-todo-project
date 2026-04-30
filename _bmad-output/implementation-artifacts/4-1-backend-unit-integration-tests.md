# Story 4.1: Backend Unit & Integration Tests

Status: done

## Story

As a **developer**,
I want automated tests for the backend API,
so that I can verify all task operations work correctly and catch regressions.

## Acceptance Criteria

1. **Given** the taskStore module **When** I run its unit tests **Then** all CRUD operations are tested: create (generates UUID, sets defaults), read (list all), update (text, completion), delete, and "not found" cases

2. **Given** the task routes **When** I run integration tests using Fastify's `inject` method **Then** all endpoints are tested: `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`

3. **Given** the POST endpoint **When** integration tests run with invalid payloads (empty text, missing text, text > 500 chars) **Then** tests verify 400 responses with appropriate validation error messages

4. **Given** the PATCH and DELETE endpoints **When** integration tests run with non-existent task IDs **Then** tests verify 404 responses

5. **Given** the health check endpoint **When** I run its test **Then** `GET /health` returns `{ "status": "ok" }` with status 200

6. **Given** all backend tests **When** I run `yarn workspace backend test` **Then** all tests pass with meaningful coverage of store logic and route handlers

## Tasks / Subtasks

- [x] Task 1: Audit existing test coverage against ACs (AC: #1-#6)
  - [x] Verify taskStore.test.ts covers all CRUD operations (AC #1) — 14 tests exist
  - [x] Verify tasks.test.ts covers all endpoints with inject (AC #2) — 12 tests exist
  - [x] Verify tasks.test.ts covers invalid payloads: missing text, empty text, text > 500 chars (AC #3)
  - [x] Verify tasks.test.ts covers 404 for PATCH and DELETE with non-existent IDs (AC #4)
  - [x] Verify health.test.ts covers GET /health (AC #5) — 1 test exists
  - [x] Run `corepack yarn workspace backend test` and confirm all 27 tests pass (AC #6)
- [x] Task 2: Add missing edge case tests to tasks.test.ts
  - [x] Add test: PATCH with text exceeding 500 characters returns 400
  - [x] Add test: PATCH with both text and completed in same request updates both fields
  - [x] Add test: POST response body contains all expected fields (id, text, completed, createdAt)
  - [x] Add test: DELETE confirms task is actually removed (GET after DELETE returns empty)
- [x] Task 3: Run full test suite and verify
  - [x] All tests pass: `corepack yarn workspace backend test`
  - [x] Lint passes: `corepack yarn lint`

## Dev Notes

### Existing Test State — Almost Everything Already Works

Tests were written incrementally during feature stories (1.1, 1.2). The current state:

**`src/store/taskStore.test.ts`** — 14 tests, comprehensive:
- `getAllTasks`: empty state, returns all tasks
- `createTask`: correct defaults (text, completed=false, id, createdAt), unique IDs, valid ISO 8601 date
- `getTask`: retrieve by ID, undefined for missing ID
- `updateTask`: update text only, completion only, both fields, non-existent ID
- `deleteTask`: successful delete, returns false for non-existent
- `clearTasks`: removes all tasks
- **AC #1 is fully satisfied.**

**`src/routes/tasks.test.ts`** — 12 tests, covers all endpoints:
- `GET /api/tasks`: empty array (200), returns all tasks (200)
- `POST /api/tasks`: creates with 201, 400 for missing text, 400 for empty text, 400 for text > 500 chars
- `PATCH /api/tasks/:id`: updates completion (200), updates text (200), 404 for non-existent, 400 for empty body
- `DELETE /api/tasks/:id`: deletes with 204, 404 for non-existent
- **ACs #2, #3, #4 are fully satisfied.**

**`src/routes/health.test.ts`** — 1 test:
- `GET /health`: returns 200 with `{ status: 'ok' }`
- **AC #5 is fully satisfied.**

**Total: 27 tests, all passing.** AC #6 is satisfied.

### What Task 2 Adds — Edge Cases for Robustness

These are NOT required by the ACs (which are already satisfied) but strengthen coverage:

1. **PATCH text > 500 chars** — POST validates this, but PATCH should too. The schema has `maxLength: 500` on the `text` field in `updateTaskSchema`, so this should return 400.

2. **PATCH both text and completed** — Individual updates are tested, but updating both in one request is not. Verifies the route handler correctly applies partial updates.

3. **POST response body structure** — Existing test checks `text`, `completed`, `id`, `createdAt` individually. A single test verifying the complete response shape ensures no extra/missing fields.

4. **DELETE followed by GET** — Existing test checks 204 status. Adding a GET after DELETE confirms the task is actually gone from the store (end-to-end verification).

### Test Patterns from Existing Code

```typescript
// Server creation pattern (reuse in all test files):
const server = buildServer()
afterAll(async () => { await server.close() })
beforeEach(async () => { clearTasks(); await server.ready() })

// Fastify inject pattern:
const response = await server.inject({ method: 'POST', url: '/api/tasks', payload: { text: 'Test' } })
expect(response.statusCode).toBe(201)
expect(response.json().text).toBe('Test')
```

### What NOT To Do

- Do NOT rewrite existing tests — they are comprehensive and correct
- Do NOT create server.test.ts or index.test.ts — not required by the ACs
- Do NOT add performance tests or stress tests — out of scope
- Do NOT add coverage configuration — that's story 4.4's scope
- Do NOT touch frontend files — this is backend-only
- Do NOT change any source code — this story only adds tests

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing Standards, Backend Organization]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Existing 27 tests already satisfied all 6 ACs from prior feature stories
- Added 4 edge case tests: PATCH text validation, combined update, response shape, delete verification
- Total: 31 tests (14 store + 16 routes + 1 health), all passing

### Completion Notes List

- All 6 acceptance criteria satisfied
- AC #1: taskStore.test.ts — 14 tests cover all CRUD operations
- AC #2: tasks.test.ts — 16 tests cover all endpoints via Fastify inject
- AC #3: POST validation — missing text (400), empty text (400), text > 500 chars (400)
- AC #4: 404 responses verified for PATCH and DELETE with non-existent IDs
- AC #5: health.test.ts — GET /health returns { status: 'ok' } with 200
- AC #6: 31 tests pass, lint clean
- Added 4 new edge case tests for comprehensive coverage

### File List

- packages/backend/src/routes/tasks.test.ts (modified — added 4 edge case tests)

## Change Log

- 2026-04-30: Story implemented — audited existing 27 tests (all ACs satisfied), added 4 edge case tests (PATCH text validation, combined update, response shape, delete verification)
