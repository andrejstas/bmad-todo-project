# Story 1.7: File-Based Task Persistence

Status: done

## Story

As a **user**,
I want my tasks to persist across server restarts,
so that I don't lose my task list when the application is restarted.

## Acceptance Criteria

1. **Given** I have created tasks **When** the backend server restarts **Then** my tasks are still available when I reload the page

2. **Given** the server starts for the first time **When** no data file exists **Then** it starts with an empty task list (no errors)

3. **Given** I create, update, or delete a task **When** the mutation completes **Then** the change is persisted to a JSON file on disk

4. **Given** the data file path **When** I check the configuration **Then** it is configurable via `DATA_FILE` environment variable with a sensible default

5. **Given** the existing test suite **When** I run all tests **Then** all tests still pass (persistence is transparent to the API layer)

## Tasks / Subtasks

- [x] Task 1: Add file persistence to taskStore (AC: #1, #2, #3, #4)
  - [x] Add `loadTasks()` function: reads JSON file on startup, returns empty Map if file doesn't exist
  - [x] Add `persist()` function: writes current Map to JSON file after every mutation
  - [x] Call `persist()` at the end of `createTask`, `updateTask`, `deleteTask`
  - [x] Initialize `tasks` Map from `loadTasks()` instead of empty `new Map()`
  - [x] Use `DATA_FILE` env var with default `./data/tasks.json`
  - [x] Create `data/` directory if it doesn't exist (use `mkdirSync` with `recursive: true`)
- [x] Task 2: Update clearTasks for test isolation (AC: #5)
  - [x] `clearTasks()` clears the Map AND deletes the data file via `unlinkSync`
  - [x] Tests don't leak state through the file system
- [x] Task 3: Update Docker and gitignore (AC: #4)
  - [x] Add `data/` to `.gitignore`
  - [x] Add `bmad-data` named volume to `docker-compose.yml` backend service
- [x] Task 4: Add persistence-specific tests
  - [x] Test: tasks persisted to JSON file on create (verified file exists and contains task)
  - [x] Test: clearTasks removes the data file
  - [x] Test: starts with empty list when no data file exists
- [x] Task 5: Verify all tests pass
  - [x] Backend tests pass: 34/34 (was 31, added 3 persistence tests)
  - [x] Frontend tests pass: 30/30
  - [x] Lint passes: clean

## Dev Notes

### Existing Code — taskStore.ts

The current store is a simple in-memory Map:
```typescript
const tasks = new Map<string, Task>()
```

All CRUD functions operate on this Map. The change is minimal: load from file on init, persist after mutations.

### Implementation — taskStore.ts

```typescript
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const DATA_FILE = process.env.DATA_FILE || './data/tasks.json'

function loadTasks(): Map<string, Task> {
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    return new Map(Object.entries(data))
  } catch {
    return new Map()
  }
}

function persist(): void {
  mkdirSync(dirname(DATA_FILE), { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(tasks)))
}

const tasks = loadTasks()
```

Then add `persist()` calls:
- End of `createTask`: after `tasks.set(task.id, task)` → `persist()`
- End of `updateTask`: after modifying the task → `persist()` (only if task was found)
- End of `deleteTask`: after `tasks.delete(id)` → `persist()` (only if delete returned true)

Update `clearTasks`:
```typescript
export function clearTasks(): void {
  tasks.clear()
  try { unlinkSync(DATA_FILE) } catch { /* file may not exist */ }
}
```

### Synchronous File I/O

Using `readFileSync`/`writeFileSync` is intentional:
- The data file is tiny (< 100KB for thousands of tasks)
- Write happens after every mutation — synchronous ensures data is flushed before response
- No race conditions between concurrent requests
- For a single-user todo app, this is the simplest correct approach

### Docker Volume Mount

Add to `docker-compose.yml` backend service:
```yaml
volumes:
  - bmad-data:/app/data
```

And at the top level:
```yaml
volumes:
  bmad-data:
```

This creates a named Docker volume that persists across container restarts.

### Test Isolation

The existing `beforeEach(() => clearTasks())` pattern in tests already calls `clearTasks()`. By making `clearTasks()` also remove the data file, tests remain isolated without changes to test code.

For the new persistence tests, simulate a restart by:
1. Creating tasks (writes to file)
2. Clearing the in-memory Map directly (`tasks.clear()` without deleting file)
3. Reloading from file (`loadTasks()`)
4. Verifying tasks are restored

Since `loadTasks` and `persist` are module-internal functions, export a `reloadTasks()` function for testing, or test via the route integration tests.

### What NOT To Do

- Do NOT use async file I/O — sync is simpler and correct for this use case
- Do NOT use SQLite or any database — JSON file is sufficient
- Do NOT change the API contract — persistence is transparent to the frontend
- Do NOT change the Task interface — same shape, same fields
- Do NOT buffer writes or use debouncing — write immediately on every mutation

### References

- [Source: Original PRD — "ensure data consistency and durability across user sessions"]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- `loadTasks()` uses try/catch — returns empty Map if file missing or corrupted
- `persist()` calls `mkdirSync(recursive: true)` — creates data/ dir on first write
- `clearTasks()` uses `unlinkSync` with try/catch — safe if file doesn't exist
- `deleteTask` only calls `persist()` if deletion was successful (returned true)
- Docker volume `bmad-data` persists data across container restarts

### Completion Notes List

- All 5 acceptance criteria satisfied
- AC #1: Tasks persist via JSON file, survive server restart
- AC #2: Missing data file gracefully starts with empty Map
- AC #3: Every create/update/delete writes to disk synchronously
- AC #4: `DATA_FILE` env var configurable, default `./data/tasks.json`
- AC #5: All 64 tests pass (34 backend + 30 frontend), no regressions
- 3 new persistence tests added
- Docker volume mount added for container persistence

### File List

- packages/backend/src/store/taskStore.ts (modified — file-based persistence)
- packages/backend/src/store/taskStore.test.ts (modified — 3 persistence tests added)
- .gitignore (modified — added data/)
- docker-compose.yml (modified — added bmad-data volume)

## Change Log

- 2026-04-30: Story implemented — JSON file persistence for tasks with DATA_FILE env var, Docker volume mount, 3 persistence tests
