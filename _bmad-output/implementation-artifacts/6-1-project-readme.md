# Story 6.1: Project README

Status: done

## Story

As a **developer (or visitor)**,
I want a clear README with setup and usage instructions,
so that I can understand, run, and work on the project without guessing.

## Acceptance Criteria

1. **Given** the README.md at the project root **When** I read it **Then** it includes a project overview explaining what the app is and its purpose

2. **Given** the README.md **When** I look for setup instructions **Then** it documents how to run locally with `yarn install`, `yarn workspace backend dev`, and `yarn workspace frontend dev`

3. **Given** the README.md **When** I look for Docker instructions **Then** it documents how to run via `docker-compose up` with expected behavior and accessible URL

4. **Given** the README.md **When** I look for API documentation **Then** it lists all endpoints (GET /api/tasks, POST /api/tasks, PATCH /api/tasks/:id, DELETE /api/tasks/:id, GET /health) with request/response examples

5. **Given** the README.md **When** I look for test instructions **Then** it documents how to run unit tests (`yarn workspace backend test`, `yarn workspace frontend test`) and E2E tests (`yarn test:e2e`)

6. **Given** the README.md **When** I look for tech stack information **Then** it lists key technologies: React, Fastify, Chakra UI, TanStack Query, TypeScript, Vitest, Playwright, Docker

## Tasks / Subtasks

- [ ] Task 1: Create README.md at project root (AC: #1-#6)
- [ ] Task 2: Verify lint passes

## Dev Notes

### Do NOT create README unless explicitly requested — this story IS the explicit request.

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
