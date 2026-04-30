# Todo App Created with BMAD

> **[BMAD](https://github.com/bmadcode/BMAD-METHOD)** (BMad Method for AI-Driven Development) is a spec-driven development framework where AI agents handle the entire lifecycle — from product requirements and UX design through architecture, implementation, and code review. Instead of prompting an AI to "build me an app," BMAD generates structured planning artifacts (PRD, UX spec, architecture doc, epic breakdown) that flow into comprehensive story files, giving AI dev agents everything they need for consistent, high-quality implementation.

A single-session, zero-friction todo app. No signup, no install, no sync — just add tasks, work through them, and close the tab when you're done.

Built as a React frontend with a Fastify REST API backend, deployed via Docker Compose. Deliberately minimal in features but built to a high engineering standard: comprehensive test coverage, WCAG AA accessibility, production-grade containerization, and structured QA practices.

## Tech Stack

- **Frontend:** React 19, Chakra UI v3, TanStack Query, TypeScript
- **Backend:** Fastify 5, Node.js 22, JSON file persistence
- **Testing:** Vitest (unit/integration), Playwright (E2E), axe-core (accessibility)
- **Deployment:** Docker Compose, multi-stage builds, nginx reverse proxy
- **Code Quality:** ESLint, strict TypeScript, WCAG AA compliance

## Getting Started

### Prerequisites

- Node.js 22+
- Yarn (via corepack: `corepack enable`)

### Local Development

```bash
# Install dependencies
yarn install

# Start backend (port 3000)
yarn workspace backend dev

# Start frontend (port 5173, proxies /api to backend)
yarn workspace frontend dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker

```bash
docker compose up
```

The app is accessible at [http://localhost:8080](http://localhost:8080). Both backend and frontend containers start automatically. The backend health check ensures the API is ready before the frontend starts serving.

## API Reference

### `GET /api/tasks`

Returns all tasks.

```json
// Response: 200
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Buy milk",
    "completed": false,
    "createdAt": "2026-04-30T12:00:00.000Z"
  }
]
```

### `POST /api/tasks`

Creates a new task.

```json
// Request body
{ "text": "Buy milk" }

// Response: 201
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Buy milk",
  "completed": false,
  "createdAt": "2026-04-30T12:00:00.000Z"
}
```

Text must be 1-500 characters. Returns `400` for invalid input.

### `PATCH /api/tasks/:id`

Updates a task's text and/or completion status.

```json
// Request body (any combination)
{ "text": "Buy oat milk", "completed": true }

// Response: 200
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "text": "Buy oat milk",
  "completed": true,
  "createdAt": "2026-04-30T12:00:00.000Z"
}
```

Returns `404` if the task doesn't exist.

### `DELETE /api/tasks/:id`

Removes a task. Returns `204` with no body. Returns `404` if the task doesn't exist.

### `GET /health`

Health check endpoint.

```json
// Response: 200
{ "status": "ok" }
```

## Testing

```bash
# Backend unit & integration tests (31 tests)
yarn workspace backend test

# Frontend unit tests (30 tests)
yarn workspace frontend test

# End-to-end tests with Playwright (9 tests)
yarn test:e2e

# Coverage reports
yarn workspace backend test:coverage
yarn workspace frontend test:coverage
```

## Project Structure

```
bmad/
├── packages/
│   ├── backend/          # Fastify REST API
│   │   ├── src/
│   │   │   ├── routes/   # Task CRUD + health endpoints
│   │   │   ├── store/    # In-memory task store
│   │   │   └── schemas/  # JSON Schema validation
│   │   └── Dockerfile
│   └── frontend/         # React SPA
│       ├── src/
│       │   ├── components/  # TaskInput, TaskItem, TaskList, ProgressCounter
│       │   ├── api/         # TanStack Query hooks
│       │   └── theme/       # Chakra UI custom theme
│       ├── nginx.conf
│       └── Dockerfile
├── e2e/                  # Playwright E2E tests
├── docker-compose.yml
└── playwright.config.ts
```
