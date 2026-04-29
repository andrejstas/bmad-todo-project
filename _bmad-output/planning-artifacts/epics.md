---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: 'complete'
completedAt: '2026-04-29'
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can create a new task by entering text and submitting it
FR2: User can edit the text of an existing task
FR3: User can mark a task as complete
FR4: User can mark a completed task as incomplete (toggle)
FR5: User can remove a task from the list
FR6: User can view all tasks in a single list showing both open and completed items
FR7: User can distinguish between open and completed tasks visually
FR8: User can see an empty state when no tasks exist
FR9: User can perform all task operations using keyboard only
FR10: User can perceive task status changes via screen reader announcements
FR11: User can identify all interactive elements via visible focus indicators
FR12: System starts with an empty task list on each application launch
FR13: System provides a health check endpoint that reports application status
FR14: System exposes RESTful endpoints for all task operations (create, read, update, delete)
FR15: System validates all task input and returns appropriate error responses for invalid data

### NonFunctional Requirements

**Performance:**
NFR1: Page load (first meaningful paint): under 1 second
NFR2: API response time for all CRUD operations: under 100ms
NFR3: Time from page load to first task added: under 3 seconds
NFR4: Frontend bundle size: minimal — no heavy framework dependencies beyond React
NFR5: Docker Compose full stack startup: under 30 seconds

**Security:**
NFR6: All user-provided task text validated and sanitized on the backend
NFR7: No raw HTML rendering of user input (XSS prevention)
NFR8: API endpoints reject malformed requests with appropriate HTTP error codes
NFR9: Docker containers run as non-root users
NFR10: No sensitive data stored (no auth tokens, no PII, no cookies)
NFR11: Code reviewed for OWASP common vulnerabilities

**Accessibility:**
NFR12: WCAG AA compliance across all UI components — zero critical violations
NFR13: Color contrast ratios: minimum 4.5:1 (normal text), 3:1 (large text)
NFR14: All interactive elements have visible focus indicators
NFR15: All form elements have associated labels
NFR16: Semantic HTML with proper landmark regions and heading hierarchy
NFR17: ARIA live regions announce dynamic content changes (task added, completed, removed)
NFR18: Fully operable via keyboard — no mouse-only interactions

**Testing:**
NFR19: Unit tests (Vitest) for component and utility testing
NFR20: Integration tests for API endpoint testing for all CRUD operations
NFR21: E2E tests with Playwright (minimum 5 passing tests)
NFR22: Minimum 70% meaningful code coverage
NFR23: Automated WCAG AA audits via Playwright + axe-core

**Docker & Deployment:**
NFR24: Multi-stage Docker builds for both frontend and backend
NFR25: Non-root user in production containers
NFR26: Health check endpoints on backend (/health)
NFR27: Docker Compose orchestrates all containers
NFR28: Environment variable support for dev/test profiles
NFR29: docker-compose up starts the full stack with zero configuration

### Additional Requirements

- **Starter template:** Yarn workspaces monorepo + Vite (react-ts) + manual Fastify setup — Architecture specifies this as the first implementation priority
- **TypeScript:** Strict mode across both packages
- **Runtime:** Node.js 22
- **Design system:** Chakra UI v3 (3.34.0) with @emotion/react
- **State management:** TanStack Query for frontend server state
- **Storage:** In-memory Map<string, Task> with O(1) lookups
- **ID generation:** crypto.randomUUID() (Node.js built-in)
- **Fastify plugins:** @fastify/cors, @fastify/helmet, @fastify/sensible
- **Validation:** Fastify built-in JSON Schema validation (Ajv)
- **Frontend serving (Docker):** nginx for static files + /api reverse proxy
- **Dev proxy:** Vite dev server proxy /api → localhost:3000
- **Testing frameworks:** Vitest (unit/integration), Playwright (E2E, root level)
- **Code quality:** ESLint with shared config
- **Shared config:** tsconfig.base.json extended by both packages
- **Naming conventions:** PascalCase for component files/names, camelCase for everything else
- **Test co-location:** *.test.ts(x) files next to source files
- **Import rules:** Relative imports only, no barrel files, no path aliases
- **Error handling:** Fastify httpErrors from @fastify/sensible, TanStack Query optimistic update with rollback
- **API response format:** Direct data (no wrapper), Fastify default errors, 201 for created, 204 for deleted

### UX Design Requirements

UX-DR1: Implement custom Chakra UI theme with design tokens — colors (#FAFAFA background, #FFFFFF surface, #1D1D1F text primary, #6E6E73 text secondary, #007AFF accent, #0066D6 accent hover, #34C759 success, #FF3B30 danger, #E5E5EA border, #F2F2F7 input background), spacing scale (8px base unit with xs/sm/md/lg/xl/2xl), border radius (12px cards/input, 6px checkboxes), shadow tokens (inset for input, elevation for card)
UX-DR2: Implement system font stack typography — type scale (20px/600 title, 14px/500 counter, 16px/400 task text, 16px/400 placeholder), line height 1.5, system font family (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)
UX-DR3: Implement "Floating Card" layout — centered Container max-width 600px, white Box with 12px border-radius and soft shadow on #FAFAFA background, generous top margin (80-100px), VStack layout inside card: title → progress counter → input → active tasks → divider → completed tasks
UX-DR4: Implement TaskInput component — always-visible Input with auto-focus on page load, placeholder "What are you working on?", submit on Enter, clear input and retain focus after submit, silently ignore empty submissions, aria-label="Add a new task", #F2F2F7 background with subtle inset shadow
UX-DR5: Implement TaskItem component — HStack with Checkbox + editable Text + IconButton (delete); states: default (delete hidden), hovered/focused (delete fades in), completed (checkbox checked, strikethrough, #6E6E73 text, moves to bottom), editing (inline edit, Enter/blur saves, Escape reverts); aria-labels: checkbox="{task text}", delete="Delete task: {task text}"
UX-DR6: Implement ProgressCounter component — Text showing "{completed} of {total} done", hidden when no tasks exist, 14px medium weight #6E6E73 color, aria-live="polite" for screen reader announcements
UX-DR7: Implement TaskList component — VStack rendered as ul with role="list", active tasks section above completed tasks section, Chakra Divider only when both sections have items, aria-live="polite" on list region
UX-DR8: Implement task section transition animation — ~200ms CSS transition when tasks move between active/completed sections; respect prefers-reduced-motion media query (disable animations)
UX-DR9: Implement progressive disclosure for delete action — IconButton hidden at rest, fades in on hover/focus for desktop (>=768px), always visible on touch devices (<768px)
UX-DR10: Implement responsive breakpoints — <768px: card full-width with 16px horizontal padding, reduced top margin (32px), delete icons always visible; >=768px: floating card centered with max-width 600px, hover-reveal delete icons
UX-DR11: Implement focus management — custom focus ring (2px solid #007AFF with offset), focus moves to next task after deletion, input retains focus after task creation, keyboard navigation: Tab through elements, Enter to submit/save, Escape to cancel, Space to toggle checkbox
UX-DR12: Implement ARIA live regions — aria-live="polite" on progress counter (count changes) and task list region (additions, removals, completion state changes)
UX-DR13: Implement empty state — just the input field with placeholder visible, no illustrations, no onboarding text, no "get started" messaging
UX-DR14: Implement inline edit interaction — click task text to enter edit mode, cursor appears at click position, Enter or blur saves changes, Escape reverts to original text, no visible save/cancel buttons, no visual mode change beyond text cursor

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Create a task |
| FR2 | Epic 2 | Edit task text |
| FR3 | Epic 1 | Mark task complete |
| FR4 | Epic 1 | Toggle task incomplete |
| FR5 | Epic 1 | Remove a task |
| FR6 | Epic 1 | View all tasks in list |
| FR7 | Epic 1 | Visual distinction open/completed |
| FR8 | Epic 1 | Empty state display |
| FR9 | Epic 3 | Keyboard-only operation |
| FR10 | Epic 3 | Screen reader announcements |
| FR11 | Epic 3 | Visible focus indicators |
| FR12 | Epic 1 | Empty list on launch |
| FR13 | Epic 1 | Health check endpoint |
| FR14 | Epic 1 | RESTful task endpoints |
| FR15 | Epic 1 | Input validation + error responses |

## Epic List

### Epic 1: Core Task Management
User can add tasks, view them in a list, complete/uncomplete tasks, remove tasks, and track progress. The full task management loop — from project scaffolding through a working end-to-end app.
**FRs covered:** FR1, FR3, FR4, FR5, FR6, FR7, FR8, FR12, FR13, FR14, FR15
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR5 (partial — no inline edit), UX-DR6, UX-DR7, UX-DR9, UX-DR13
**Notes:** Includes project scaffolding (Architecture first priority), backend API with validation/health check, Chakra theme, and all primary components. Basic accessibility (semantic HTML, labels, contrast) baked in from the start.

### Epic 2: Task Editing & Interaction Polish
User can edit existing task text inline. Smooth animations when tasks move between sections, and responsive design across devices.
**FRs covered:** FR2
**UX-DRs covered:** UX-DR5 (edit state), UX-DR8, UX-DR10, UX-DR14
**Notes:** Standalone enhancement to the core loop. Adds the inline edit flow (click → edit → Enter/Escape) plus transition animations and mobile breakpoint.

### Epic 3: Accessibility & Inclusive Design
All users can operate the entire app via keyboard only, with full screen reader support and WCAG AA compliance validated.
**FRs covered:** FR9, FR10, FR11
**UX-DRs covered:** UX-DR11, UX-DR12
**NFRs covered:** NFR12, NFR13, NFR14, NFR15, NFR16, NFR17, NFR18
**Notes:** Builds on components from Epics 1-2. Adds comprehensive keyboard navigation flows, ARIA live region announcements, focus management (post-delete, post-create), and prefers-reduced-motion support.

### Epic 4: Testing & Quality Assurance
Comprehensive automated test suites verify all task operations, accessibility compliance, and code quality meet production standards.
**NFRs covered:** NFR19, NFR20, NFR21, NFR22, NFR23
**Notes:** Vitest unit tests for both packages, API integration tests, Playwright E2E (min 5 tests), axe-core accessibility audits. Targets 70% meaningful coverage.

### Epic 5: Containerized Deployment
The complete app runs production-ready via a single `docker-compose up` with optimized, secure containers and zero configuration.
**NFRs covered:** NFR24, NFR25, NFR26, NFR27, NFR28, NFR29
**Notes:** Multi-stage Dockerfiles, nginx config (static serving + API proxy), docker-compose.yml, non-root users, health checks. Also covers NFR1 (performance) and NFR5 (startup time) validation.

### Epic 6: Documentation & Project Completion
README with setup instructions and API reference, plus AI integration log documenting the BMAD development process.
**Notes:** Covers PRD documentation deliverables.

## Epic 1: Core Task Management

User can add tasks, view them in a list, complete/uncomplete tasks, remove tasks, and track progress.

### Story 1.1: Project Scaffolding & Dev Environment

As a **developer**,
I want a fully configured monorepo with frontend and backend packages,
So that I can start building features with a consistent, working dev environment.

**Acceptance Criteria:**

**Given** a fresh checkout of the repository
**When** I run `yarn install`
**Then** all dependencies install without errors across both workspaces

**Given** the project is initialized
**When** I inspect the directory structure
**Then** it contains `packages/frontend` (Vite React-TS) and `packages/backend` (Fastify TypeScript) workspaces with a root `package.json` declaring `"workspaces": ["packages/*"]`

**Given** both packages are set up
**When** I run `yarn workspace backend dev`
**Then** the Fastify server starts on port 3000 using `tsx watch`

**Given** both packages are set up
**When** I run `yarn workspace frontend dev`
**Then** the Vite dev server starts with HMR enabled

**Given** the frontend dev server is running
**When** a request is made to `/api/*`
**Then** it is proxied to `localhost:3000` (Vite dev proxy configured)

**Given** the project root
**When** I inspect shared configs
**Then** `tsconfig.base.json` exists with strict mode and both packages extend it, and a shared ESLint config is present

**Given** the project root
**When** I check `.gitignore`
**Then** it excludes `node_modules`, `dist`, build artifacts, and IDE files

### Story 1.2: Backend REST API with In-Memory Store

As a **user**,
I want a REST API that manages my tasks,
So that my task data is created, retrieved, updated, and deleted reliably.

**Acceptance Criteria:**

**Given** the server is running
**When** I `GET /api/tasks`
**Then** I receive an empty array `[]` with status 200

**Given** the server is running
**When** I `POST /api/tasks` with `{ "text": "Buy milk" }`
**Then** I receive the created task `{ id, text, completed: false, createdAt }` with status 201

**Given** a task exists
**When** I `PATCH /api/tasks/:id` with `{ "completed": true }`
**Then** the task is updated and returned with status 200

**Given** a task exists
**When** I `PATCH /api/tasks/:id` with `{ "text": "Updated text" }`
**Then** the task text is updated and returned with status 200

**Given** a task exists
**When** I `DELETE /api/tasks/:id`
**Then** the task is removed and I receive status 204 with no body

**Given** no task exists with that ID
**When** I `PATCH` or `DELETE /api/tasks/:id`
**Then** I receive status 404 with `{ statusCode: 404, error: "Not Found", message: "Task not found" }`

**Given** I `POST /api/tasks` with empty text, missing text, or text exceeding 500 characters
**When** the request is processed
**Then** I receive status 400 with a JSON Schema validation error

**Given** the server is running
**When** I `GET /health`
**Then** I receive `{ "status": "ok" }` with status 200

**Given** the server restarts
**When** I `GET /api/tasks`
**Then** the list is empty (in-memory storage, no persistence between restarts)

**Given** the server is configured
**When** I check registered plugins
**Then** `@fastify/cors`, `@fastify/helmet`, and `@fastify/sensible` are loaded

### Story 1.3: Frontend Theme & Floating Card Layout

As a **user**,
I want a clean, minimal app interface,
So that I can focus on my tasks without visual distractions.

**Acceptance Criteria:**

**Given** the app loads
**When** the page renders
**Then** I see a white floating card centered on an off-white (`#FAFAFA`) background

**Given** the card is rendered
**When** I inspect its styles
**Then** it has max-width 600px, 12px border-radius, and a soft elevation shadow (`0 1px 3px rgba(0,0,0,0.08)`)

**Given** the page loads
**When** I check the layout
**Then** the card has generous top margin (80-100px) and uses a VStack for vertical content flow

**Given** the Chakra theme is applied
**When** I inspect typography
**Then** the system font stack is used (`-apple-system, BlinkMacSystemFont, ...`) with the defined type scale (20px/600 title, 14px/500 counter, 16px/400 body)

**Given** the Chakra theme is applied
**When** I inspect color tokens
**Then** the full palette is defined: `#1D1D1F` primary text, `#6E6E73` secondary, `#007AFF` accent, `#0066D6` accent hover, `#34C759` success, `#FF3B30` danger, `#E5E5EA` border, `#F2F2F7` input background

**Given** the Chakra theme is applied
**When** I inspect spacing and radii tokens
**Then** the 8px base unit scale (xs through 2xl) and border radii (12px cards, 6px checkboxes) are defined

**Given** the app shell renders
**When** I check the HTML
**Then** it uses semantic elements — `main` landmark region and `h1` heading for the app title

**Given** the app shell renders
**When** I check providers
**Then** `ChakraProvider` and `QueryClientProvider` wrap the application

### Story 1.4: Add Tasks & View Task List

As a **user**,
I want to add tasks and see them in a list,
So that I can capture what I need to do and see everything at a glance.

**Acceptance Criteria:**

**Given** the page loads
**When** I look at the interface
**Then** the input field is visible, auto-focused, with placeholder "What are you working on?" and `#F2F2F7` background with subtle inset shadow

**Given** the input is focused
**When** I type "Buy milk" and press Enter
**Then** the task appears in the list below with an unchecked checkbox and the task text

**Given** I just added a task
**When** it appears in the list
**Then** the input field clears and retains focus for rapid entry

**Given** I press Enter with empty or whitespace-only text
**When** the submission is processed
**Then** nothing happens — silently ignored, no error indication

**Given** no tasks exist
**When** I view the app
**Then** I see only the input field with placeholder (empty state — no illustrations, no onboarding text)

**Given** multiple tasks are added
**When** I view the list
**Then** all tasks are displayed in a `ul` with `role="list"`, each task as a `li` element

**Given** I add a task
**When** the mutation fires
**Then** TanStack Query performs an optimistic update (task appears immediately) with rollback on API failure

**Given** one or more tasks exist
**When** I look at the progress counter
**Then** it displays "{completed} of {total} done" in 14px medium weight `#6E6E73`

**Given** no tasks exist
**When** I look for the progress counter
**Then** it is not rendered

**Given** the input field
**When** I check its accessibility
**Then** it has `aria-label="Add a new task"`

### Story 1.5: Complete & Uncomplete Tasks with Progress Tracking

As a **user**,
I want to check off tasks as I complete them,
So that I can track my progress and see what's left to do.

**Acceptance Criteria:**

**Given** an active task exists
**When** I click its checkbox
**Then** it is marked as complete via API call with optimistic update

**Given** a task is completed
**When** I view it
**Then** it displays strikethrough text in secondary color (`#6E6E73`)

**Given** both active and completed tasks exist
**When** I view the list
**Then** active tasks appear above completed tasks, separated by a Chakra `Divider`

**Given** a completed task exists
**When** I click its checkbox again
**Then** it toggles back to active and moves to the active section

**Given** I complete a task
**When** the UI updates
**Then** the progress counter reflects the new count (e.g., "2 of 5 done")

**Given** all tasks are complete
**When** I view the progress counter
**Then** it shows "{total} of {total} done"

**Given** only completed tasks exist (no active tasks)
**When** I view the list
**Then** completed tasks are shown without a divider

**Given** only active tasks exist (no completed tasks)
**When** I view the list
**Then** active tasks are shown without a divider

**Given** a task's checkbox
**When** I inspect its accessibility
**Then** it has `aria-label` set to the task text

### Story 1.6: Remove Tasks

As a **user**,
I want to remove tasks I no longer need,
So that my list stays clean and relevant.

**Acceptance Criteria:**

**Given** a task exists
**When** I hover over the task row
**Then** a delete icon (IconButton) fades in

**Given** a task exists
**When** I focus the task row via keyboard
**Then** the delete icon becomes visible

**Given** tasks are at rest (not hovered or focused)
**When** I view the list
**Then** no delete icons are visible (progressive disclosure)

**Given** the delete icon is visible
**When** I click it
**Then** the task is removed immediately via API call with optimistic update — no confirmation dialog

**Given** I remove the last remaining task
**When** the list becomes empty
**Then** the empty state is displayed (input field with placeholder)

**Given** I remove a task
**When** the UI updates
**Then** the progress counter reflects the updated counts

**Given** the delete button
**When** I inspect its accessibility
**Then** it has `aria-label="Delete task: {task text}"`

## Epic 2: Task Editing & Interaction Polish

User can edit existing task text inline. Smooth animations when tasks move between sections, and responsive design across devices.

### Story 2.1: Inline Task Editing

As a **user**,
I want to edit a task's text by clicking on it,
So that I can fix typos or clarify tasks without removing and re-adding them.

**Acceptance Criteria:**

**Given** a task exists in the list
**When** I click on the task text
**Then** the text becomes editable inline with a cursor at the click position

**Given** a task is in edit mode
**When** I modify the text and press Enter
**Then** the updated text is saved via API call with optimistic update and edit mode exits

**Given** a task is in edit mode
**When** I modify the text and click away (blur)
**Then** the updated text is saved via API call and edit mode exits

**Given** a task is in edit mode
**When** I press Escape
**Then** the text reverts to its original value and edit mode exits

**Given** a task is in edit mode
**When** I clear all text and press Enter or blur
**Then** the edit is treated as saving empty text — same validation as creation (revert if backend rejects)

**Given** a task is in edit mode
**When** I look at the visual presentation
**Then** there is no visible mode change beyond the text cursor appearing — no save/cancel buttons, no border change

**Given** a completed task exists
**When** I click on its text
**Then** I can edit it the same way as an active task

### Story 2.2: Task Section Transition Animations

As a **user**,
I want smooth visual transitions when tasks move between sections,
So that I can track where tasks went after completing or uncompleting them.

**Acceptance Criteria:**

**Given** an active task exists
**When** I mark it as complete
**Then** the task animates smoothly to the completed section over ~200ms

**Given** a completed task exists
**When** I toggle it back to active
**Then** the task animates smoothly to the active section over ~200ms

**Given** my OS has `prefers-reduced-motion: reduce` enabled
**When** tasks move between sections
**Then** animations are disabled and transitions are instant

**Given** a task is being added to the list
**When** it appears
**Then** it enters with a subtle transition (not a hard pop-in)

### Story 2.3: Responsive Layout & Touch Adaptation

As a **user on a tablet or phone**,
I want the app to adapt to my screen size,
So that I can manage tasks comfortably on any device.

**Acceptance Criteria:**

**Given** a viewport width below 768px
**When** the app renders
**Then** the card goes full-width with 16px horizontal padding (no floating effect)

**Given** a viewport width below 768px
**When** the layout renders
**Then** the top margin is reduced to 32px to maximize content area

**Given** a viewport width below 768px
**When** I view the task list
**Then** delete icons are always visible (no hover-reveal on touch devices)

**Given** a viewport width of 768px or above
**When** the app renders
**Then** the floating card layout is shown, centered with max-width 600px and hover-reveal delete icons

**Given** the responsive breakpoints
**When** I inspect the implementation
**Then** Chakra UI responsive array props are used — no custom media queries

## Epic 3: Accessibility & Inclusive Design

All users can operate the entire app via keyboard only, with full screen reader support and WCAG AA compliance validated.

### Story 3.1: Keyboard Navigation & Focus Management

As a **keyboard-only user**,
I want to perform all task operations without a mouse,
So that I can use the app fully with keyboard navigation.

**Acceptance Criteria:**

**Given** the page loads
**When** I start tabbing
**Then** focus moves in logical order: input field → first task checkbox → first task text → first task delete → next task... and so on

**Given** the input field is focused
**When** I type text and press Enter
**Then** the task is created and focus remains on the input field

**Given** a task checkbox is focused
**When** I press Space
**Then** the task completion state toggles

**Given** a task's text is focused
**When** I press Enter
**Then** inline edit mode activates

**Given** a task is in edit mode
**When** I press Escape
**Then** edit mode exits and the text reverts to original

**Given** a task's delete button is focused
**When** I press Enter or Space
**Then** the task is removed and focus moves to the next task in the list

**Given** I delete the last task in the list
**When** the list becomes empty
**Then** focus moves to the input field

**Given** any interactive element is focused
**When** I look at the focus indicator
**Then** a custom focus ring is visible: 2px solid `#007AFF` with offset — clearly visible on both white and off-white backgrounds

**Given** all interactive elements on the page
**When** I tab through the entire interface
**Then** every element is reachable and operable — no mouse-only interactions exist

### Story 3.2: Screen Reader Support & ARIA Live Regions

As a **screen reader user**,
I want task changes announced to me automatically,
So that I can track what's happening without seeing the screen.

**Acceptance Criteria:**

**Given** the progress counter is rendered
**When** a task is added, completed, uncompleted, or removed
**Then** the updated count is announced via `aria-live="polite"` (e.g., "2 of 5 done")

**Given** the task list region
**When** a new task is added
**Then** the addition is announced to the screen reader

**Given** the task list region
**When** a task is removed
**Then** the removal is announced to the screen reader

**Given** a task's checkbox
**When** its state changes (checked/unchecked)
**Then** the screen reader announces the state change

**Given** the task list container
**When** I inspect its ARIA attributes
**Then** it has `aria-live="polite"` on the list region

**Given** all ARIA live region announcements
**When** they fire
**Then** they use `polite` (not `assertive`) to avoid interrupting the user's current action

### Story 3.3: WCAG AA Compliance Audit & Fixes

As a **user with accessibility needs**,
I want the app to meet WCAG AA standards,
So that I can use it regardless of my abilities.

**Acceptance Criteria:**

**Given** all text elements in the app
**When** I measure contrast ratios against their backgrounds
**Then** normal text meets 4.5:1 minimum and large text meets 3:1 minimum

**Given** the app's HTML structure
**When** I inspect landmarks
**Then** proper landmark regions exist (`main`) with correct heading hierarchy (`h1` for app title)

**Given** all form elements (input field, checkboxes)
**When** I inspect their labels
**Then** each has an associated label (via `aria-label` or visible label)

**Given** the app's HTML structure
**When** I inspect semantic elements
**Then** the task list uses `ul`/`li`, interactive elements use proper roles, and no `div`-only click handlers exist

**Given** the strikethrough styling on completed tasks
**When** I assess how completion state is conveyed
**Then** it is communicated through both visual change (strikethrough + color) and checkbox state — not color alone

**Given** all interactive elements
**When** I check their click/touch targets
**Then** each has a minimum 44x44px target area

**Given** the complete app
**When** I test all interactions via keyboard only
**Then** every action (add, edit, complete, uncomplete, remove) is achievable without a mouse (NFR18)

## Epic 4: Testing & Quality Assurance

Comprehensive automated test suites verify all task operations, accessibility compliance, and code quality meet production standards.

### Story 4.1: Backend Unit & Integration Tests

As a **developer**,
I want automated tests for the backend API,
So that I can verify all task operations work correctly and catch regressions.

**Acceptance Criteria:**

**Given** the taskStore module
**When** I run its unit tests
**Then** all CRUD operations are tested: create (generates UUID, sets defaults), read (list all), update (text, completion), delete, and "not found" cases

**Given** the task routes
**When** I run integration tests using Fastify's `inject` method
**Then** all endpoints are tested: `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`

**Given** the POST endpoint
**When** integration tests run with invalid payloads (empty text, missing text, text > 500 chars)
**Then** tests verify 400 responses with appropriate validation error messages

**Given** the PATCH and DELETE endpoints
**When** integration tests run with non-existent task IDs
**Then** tests verify 404 responses

**Given** the health check endpoint
**When** I run its test
**Then** `GET /health` returns `{ "status": "ok" }` with status 200

**Given** all backend tests
**When** I run `yarn workspace backend test`
**Then** all tests pass with meaningful coverage of store logic and route handlers

### Story 4.2: Frontend Unit Tests

As a **developer**,
I want automated tests for frontend components,
So that I can verify UI behavior and catch regressions.

**Acceptance Criteria:**

**Given** the TaskInput component
**When** I run its tests
**Then** they verify: rendering with placeholder, submitting a task on Enter, clearing input after submit, ignoring empty submissions, auto-focus on mount

**Given** the TaskItem component
**When** I run its tests
**Then** they verify: rendering task text and checkbox, completed state styling (strikethrough), delete button visibility on hover/focus, calling mutation hooks on checkbox toggle and delete

**Given** the TaskList component
**When** I run its tests
**Then** they verify: rendering active and completed sections, divider shown only when both sections have items, empty state rendering

**Given** the ProgressCounter component
**When** I run its tests
**Then** they verify: correct "{completed} of {total} done" display, hidden when no tasks exist, aria-live attribute present

**Given** the TanStack Query hooks (api/tasks.ts)
**When** I run their tests
**Then** they verify: fetch calls with correct endpoints, optimistic update behavior, rollback on error

**Given** all frontend tests
**When** I run `yarn workspace frontend test`
**Then** all tests pass

### Story 4.3: End-to-End Tests with Playwright

As a **developer**,
I want E2E tests that validate complete user journeys,
So that I can confirm the full stack works together correctly.

**Acceptance Criteria:**

**Given** the Playwright test suite
**When** I run it against the running app
**Then** a minimum of 5 passing tests cover the core user journeys

**Given** E2E test 1 (task creation)
**When** it runs
**Then** it verifies: opening the app, typing a task, pressing Enter, and seeing the task in the list

**Given** E2E test 2 (task completion)
**When** it runs
**Then** it verifies: creating a task, clicking the checkbox, seeing strikethrough styling, and the task moving to the completed section

**Given** E2E test 3 (task editing)
**When** it runs
**Then** it verifies: creating a task, clicking the text, editing it, pressing Enter, and seeing the updated text

**Given** E2E test 4 (task deletion)
**When** it runs
**Then** it verifies: creating a task, hovering to reveal delete icon, clicking delete, and the task disappearing

**Given** E2E test 5 (full workflow)
**When** it runs
**Then** it verifies: adding multiple tasks, completing some, editing one, deleting one, and confirming the progress counter shows correct counts throughout

**Given** the Playwright config
**When** I inspect it
**Then** it is configured at the project root level, spanning both frontend and backend services

### Story 4.4: Accessibility Audit Tests & Coverage Report

As a **developer**,
I want automated accessibility audits and a coverage report,
So that I can verify WCAG AA compliance and meet the 70% coverage target.

**Acceptance Criteria:**

**Given** the Playwright E2E test suite
**When** axe-core accessibility tests run
**Then** zero critical WCAG AA violations are reported

**Given** the axe-core audit
**When** it scans the app in various states (empty, with tasks, with completed tasks)
**Then** each state passes with no critical or serious violations

**Given** the axe-core audit
**When** it checks contrast ratios
**Then** all text/background combinations meet WCAG AA minimums (4.5:1 normal, 3:1 large)

**Given** the backend test suite
**When** I check coverage output
**Then** meaningful code coverage meets or exceeds 70%

**Given** the frontend test suite
**When** I check coverage output
**Then** meaningful code coverage meets or exceeds 70%

**Given** both test suites
**When** coverage reports are generated
**Then** reports are available in a standard format (e.g., lcov, text summary)

## Epic 5: Containerized Deployment

The complete app runs production-ready via a single `docker-compose up` with optimized, secure containers and zero configuration.

### Story 5.1: Backend Dockerfile with Multi-Stage Build

As a **developer**,
I want a production-optimized Docker image for the backend,
So that the API runs securely and efficiently in a container.

**Acceptance Criteria:**

**Given** the backend Dockerfile
**When** I inspect its stages
**Then** it uses a multi-stage build: stage 1 compiles TypeScript with `tsc`, stage 2 runs the compiled JavaScript with Node.js

**Given** the production image
**When** I inspect the running container
**Then** it runs as a non-root user

**Given** the backend container
**When** it starts
**Then** the Fastify server listens on the configured `PORT` (default 3000) and `HOST` (default 0.0.0.0)

**Given** the backend Dockerfile
**When** I check environment variable support
**Then** `PORT`, `HOST`, and `CORS_ORIGIN` are configurable via environment variables

**Given** the production image
**When** I inspect its contents
**Then** only production dependencies and compiled output are included — no devDependencies, no TypeScript source

**Given** the backend container is running
**When** I `GET /health`
**Then** it returns `{ "status": "ok" }` with status 200

### Story 5.2: Frontend Dockerfile & Nginx Configuration

As a **developer**,
I want a production-optimized Docker image for the frontend,
So that static files are served efficiently with proper API proxying.

**Acceptance Criteria:**

**Given** the frontend Dockerfile
**When** I inspect its stages
**Then** it uses a multi-stage build: stage 1 builds with Vite (Node.js), stage 2 serves with nginx

**Given** the production image
**When** I inspect the running container
**Then** nginx runs as a non-root user

**Given** the nginx configuration
**When** a request is made to `/api/*`
**Then** it is reverse-proxied to the backend container

**Given** the nginx configuration
**When** a request is made to any other path
**Then** it serves the Vite build output (static files) with the SPA fallback to `index.html`

**Given** the frontend container is running
**When** I request the root URL `/`
**Then** it returns the app's `index.html` with status 200

**Given** the production image
**When** I inspect its contents
**Then** only the Vite build output and nginx config are included — no source code, no node_modules

### Story 5.3: Docker Compose Orchestration

As a **developer**,
I want a single command to start the entire app,
So that I can run the full stack with zero configuration.

**Acceptance Criteria:**

**Given** the project root
**When** I run `docker-compose up`
**Then** both frontend and backend containers start and the app is accessible

**Given** Docker Compose is running
**When** I access the app in a browser
**Then** the frontend loads and API calls work through the nginx proxy

**Given** the docker-compose.yml
**When** I inspect the service definitions
**Then** both services are on a shared Docker network for internal communication

**Given** the docker-compose.yml
**When** I inspect health check configuration
**Then** the backend service has a health check using `GET /health`

**Given** the docker-compose.yml
**When** I inspect the frontend service
**Then** it depends on the backend service being healthy before starting

**Given** the docker-compose.yml
**When** I check environment variable configuration
**Then** environment variables (`PORT`, `HOST`, `CORS_ORIGIN`) are configurable with sensible defaults

**Given** a cold start
**When** I run `docker-compose up` and measure time
**Then** the full stack is usable within 30 seconds (NFR5)

## Epic 6: Documentation & Project Completion

README with setup instructions and API reference, plus AI integration log documenting the BMAD development process.

### Story 6.1: Project README

As a **developer (or visitor)**,
I want a clear README with setup and usage instructions,
So that I can understand, run, and work on the project without guessing.

**Acceptance Criteria:**

**Given** the README.md at the project root
**When** I read it
**Then** it includes a project overview explaining what the app is and its purpose

**Given** the README.md
**When** I look for setup instructions
**Then** it documents how to run locally with `yarn install`, `yarn workspace backend dev`, and `yarn workspace frontend dev`

**Given** the README.md
**When** I look for Docker instructions
**Then** it documents how to run via `docker-compose up` with expected behavior and accessible URL

**Given** the README.md
**When** I look for API documentation
**Then** it lists all endpoints (GET /api/tasks, POST /api/tasks, PATCH /api/tasks/:id, DELETE /api/tasks/:id, GET /health) with request/response examples

**Given** the README.md
**When** I look for test instructions
**Then** it documents how to run unit tests (`yarn workspace backend test`, `yarn workspace frontend test`) and E2E tests (`yarn test:e2e`)

**Given** the README.md
**When** I look for tech stack information
**Then** it lists key technologies: React, Fastify, Chakra UI, TanStack Query, TypeScript, Vitest, Playwright, Docker

### Story 6.2: AI Integration Log

As a **project stakeholder**,
I want a log of how BMAD guided the development process,
So that the spec-driven development methodology is documented for reference.

**Acceptance Criteria:**

**Given** the AI integration log document
**When** I read it
**Then** it describes the BMAD framework and its role in the project

**Given** the AI integration log
**When** I look for artifacts produced
**Then** it lists the specs created: PRD, UX Design Specification, Architecture Decision Document, Epic Breakdown

**Given** the AI integration log
**When** I look for process documentation
**Then** it describes the workflow: product brief → PRD → UX design → architecture → epics/stories → implementation

**Given** the AI integration log
**When** I look for outcomes
**Then** it summarizes what worked well and any observations about the spec-driven approach
