---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments: []
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - bmad

**Author:** Andrej
**Date:** 2026-04-28

## Executive Summary

A single-session, zero-friction todo app for people who want a scratch list right now — no signup, no install, no sync. The product targets solo individuals (developers mid-session, students working through a problem set, anyone planning the next hour) who need a disposable task list that appears instantly and disappears when they're done. Built as a React frontend with a Fastify backend, deployed via Docker Compose, with purely in-memory state.

The app is deliberately minimal in features but built to a high engineering standard: comprehensive test coverage (unit, integration, E2E), WCAG AA accessibility, production-grade containerization with health checks, and structured QA practices. The project demonstrates spec-driven development using the BMAD framework.

### What Makes This Special

Every competitor adds features. This product removes them. No accounts, no persistence, no categories, no priorities, no due dates — just add, edit, and remove tasks. Most todo apps are over-engineered for the user and under-engineered for quality. This one flips that — radically simple for the user, rigorously built underneath with full test suites, accessibility compliance, and containerized deployment.

## Project Classification

- **Type:** Web Application (React SPA + Fastify API)
- **Domain:** General / Personal Productivity
- **Complexity:** Medium — simple app surface, significant quality and infrastructure requirements
- **Context:** Greenfield — new product built from scratch
- **Deployment:** Docker Compose (single command startup)
- **Methodology:** BMAD spec-driven development

## Success Criteria

### User Success

- User opens the app and adds their first task within seconds — no onboarding, no instructions needed
- The interaction model is immediately intuitive: add, edit, check off, remove — nothing to learn
- A typical session: open tab, jot down tasks, work through them, close tab

### Business Success

- Andrej uses the app regularly for real work sessions — it replaces reaching for other tools or scratch notes
- The app feels polished enough to be a go-to utility, not a prototype
- The project demonstrates the BMAD spec-driven development process end-to-end

### Technical Success

- App starts with a single `docker-compose up` command and works out of the box
- Frontend loads near-instantly (sub-second meaningful paint)
- All task operations feel instantaneous — no perceptible latency
- Test coverage meets or exceeds 70% meaningful coverage
- WCAG AA accessibility audit passes with zero critical violations
- Health check endpoints report container status correctly
- Multi-stage Docker builds produce optimized, non-root containers

### Measurable Outcomes

- Time to first task added: under 3 seconds from page load
- All CRUD operations respond in under 100ms
- Docker Compose startup to usable app: under 30 seconds
- Test coverage: minimum 70% meaningful code coverage
- Accessibility: zero critical WCAG violations
- Security: no critical or high findings in code review
- E2E: minimum 5 passing Playwright tests
- Application runs successfully via `docker-compose up`

## Product Scope

### Single Release — Complete Feature Set

**Core Application:**
- Add a task (single action — type and enter)
- Edit a task's text inline
- Mark a task as complete (toggle)
- Remove a task
- Visual distinction between open and completed tasks
- Clean, minimal, WCAG AA accessible UI

**Technical Stack:**
- React SPA frontend
- Fastify REST API backend
- In-memory storage (no database, resets on restart)

**Quality & Testing:**
- Unit, integration, and E2E test suites
- Minimum 5 passing Playwright E2E tests
- QA deliverables: coverage report, accessibility audit, security review

**Infrastructure:**
- Docker Compose deployment with multi-stage builds and health checks
- Environment variable support for dev/test profiles

**Documentation:**
- README with setup instructions
- AI integration log documenting how BMAD guided the implementation

### Risk Mitigation Strategy

**Technical Risks:** Minimal. React + Fastify is well-established and the feature set is straightforward.
**Market Risks:** Not applicable — personal utility.
**Resource Risks:** Solo developer. If time is limited, QA depth (performance testing, security review) can be scaled back without affecting core app functionality.

## User Journeys

### Journey 1: Dev Mid-Session — "Just Let Me Track This"

**Persona:** Andrej, a developer deep in a coding session.

**Opening Scene:** Andrej is refactoring a module and realizes there are four things he needs to do before he can call it done. He doesn't want to break flow by opening a full project tracker or finding a notepad. He needs a list *right now*.

**Rising Action:** He opens a browser tab, hits the app URL. The page loads instantly. He types his first task and hits enter — it's on the list. Three more follow in quick succession. No clicks wasted, no configuration, no distractions.

**Climax:** Halfway through the session, he checks off two tasks and sees what's left at a glance. He edits the third task to clarify scope. The app is doing exactly one thing — holding his list — and doing it perfectly.

**Resolution:** He finishes the last task, closes the tab, and moves on. The list served its purpose and is gone. No cleanup, no lingering state, no notifications about abandoned tasks.

### Journey 2: Quick Planning — "What Do I Need to Do Right Now?"

**Persona:** A student sitting down for a 2-hour study session.

**Opening Scene:** They have a vague sense of "a lot to do" but haven't organized it. They open the app to dump everything out of their head.

**Rising Action:** They quickly type out six tasks — read chapter 5, do practice problems, review notes, etc. As they work, they realize one task should say something different, so they edit it inline. Simple.

**Climax:** They work through the list, checking items off one by one. The visual progress of completed tasks gives a small sense of momentum.

**Resolution:** Session over, they close the tab. Next study session, they'll open a fresh list. No stale tasks haunting them from last week.

### Journey Requirements Summary

Both journeys reveal the same compact set of capabilities:
- **Instant start:** No onboarding, no loading state — the app is ready immediately
- **Task CRUD:** Add, edit, complete, remove — the entire feature set
- **Visual clarity:** Clear distinction between open and completed tasks
- **Accessible by default:** All interactions keyboard-navigable, screen reader compatible, WCAG AA compliant
- **Zero cleanup:** Close the tab and it's done. Fresh start next time
- **No secondary workflows:** No admin, no settings, no account management

## Technical Requirements

### Architecture

- **SPA Architecture:** React single-page app, client-side routing not required (single view)
- **API Communication:** RESTful request-response over HTTP. No polling, no WebSockets
- **State Management:** Frontend reflects backend state. Each action (add, edit, complete, remove) is an API call

### Browser Support

- Modern evergreen browsers only: Chrome, Firefox, Safari, Edge (latest versions)
- No IE11 or legacy browser support, no polyfills needed

### Responsive Design

- Desktop-first usage expected (developers at workstations)
- Should remain usable on tablet/mobile viewports but not a priority

### Testing Infrastructure

- **Unit tests:** Jest or Vitest for component and utility testing
- **Integration tests:** API endpoint testing for all CRUD operations
- **E2E tests:** Playwright for browser-based user journey testing (minimum 5 passing tests)
- **Coverage target:** Minimum 70% meaningful code coverage
- **Accessibility tests:** Automated WCAG AA audits via Playwright + axe-core

### Docker & Deployment

- Multi-stage Docker builds for both frontend and backend
- Non-root user in production containers
- Health check endpoints on backend (`/health`)
- Docker Compose orchestrates all containers
- Environment variable support for dev/test profiles
- `docker-compose up` starts the full stack with zero configuration

## Functional Requirements

### Task Management

- FR1: User can create a new task by entering text and submitting it
- FR2: User can edit the text of an existing task
- FR3: User can mark a task as complete
- FR4: User can mark a completed task as incomplete (toggle)
- FR5: User can remove a task from the list
- FR6: User can view all tasks in a single list showing both open and completed items

### Visual Feedback

- FR7: User can distinguish between open and completed tasks visually
- FR8: User can see an empty state when no tasks exist

### Accessibility

- FR9: User can perform all task operations using keyboard only
- FR10: User can perceive task status changes via screen reader announcements
- FR11: User can identify all interactive elements via visible focus indicators

### System Lifecycle

- FR12: System starts with an empty task list on each application launch
- FR13: System provides a health check endpoint that reports application status

### API

- FR14: System exposes RESTful endpoints for all task operations (create, read, update, delete)
- FR15: System validates all task input and returns appropriate error responses for invalid data

## Non-Functional Requirements

### Performance

- Page load (first meaningful paint): under 1 second
- API response time for all CRUD operations: under 100ms
- Time from page load to first task added: under 3 seconds
- Frontend bundle size: minimal — no heavy framework dependencies beyond React
- Docker Compose full stack startup: under 30 seconds

### Security

- All user-provided task text validated and sanitized on the backend
- No raw HTML rendering of user input (XSS prevention)
- API endpoints reject malformed requests with appropriate HTTP error codes
- Docker containers run as non-root users
- No sensitive data stored (no auth tokens, no PII, no cookies)
- Code reviewed for OWASP common vulnerabilities

### Accessibility

- WCAG AA compliance across all UI components — zero critical violations
- Color contrast ratios: minimum 4.5:1 (normal text), 3:1 (large text)
- All interactive elements have visible focus indicators
- All form elements have associated labels
- Semantic HTML with proper landmark regions and heading hierarchy
- ARIA live regions announce dynamic content changes (task added, completed, removed)
- Fully operable via keyboard — no mouse-only interactions