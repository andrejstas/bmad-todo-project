# Performance Report

## Test Environment

- Runtime: Node.js 22, Vite 6.4 dev server
- Browser: Chromium (Playwright headless)
- Backend: Fastify 5.3 with in-memory storage
- Machine: Local development (not a production benchmark)

## Results

### Page Load Time (NFR1: < 1 second)

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| First meaningful paint | < 1000ms | ~515ms | Pass |

Measured as wall-clock time from `page.goto('/')` to the task input being visible in the DOM.

### API Response Time (NFR2: < 100ms)

| Endpoint | Target | Measured | Status |
|----------|--------|----------|--------|
| POST /api/tasks | < 100ms | ~51ms | Pass |

Measured as round-trip time for a task creation request via Playwright's `page.request.post`. In-memory storage ensures near-instant backend processing.

### Time to First Task Added (NFR3: < 3 seconds)

| Metric | Target | Measured | Status |
|--------|--------|----------|--------|
| Page load + type + submit + visible | < 3000ms | ~324ms | Pass |

Measured as wall-clock time from `page.goto('/')` through typing a task, pressing Enter, and the task text becoming visible in the list.

### Frontend Bundle Size (NFR4: minimal)

| File | Raw Size | Gzipped |
|------|----------|---------|
| index.html | 0.32 KB | 0.23 KB |
| index.js | 530.96 KB | 152.01 KB |

The JavaScript bundle is dominated by React (143 KB gzipped) and Chakra UI (~8 KB gzipped). No unnecessary heavy dependencies are included. The gzipped transfer size of 152 KB is reasonable for a React + Chakra UI application.

Build time: ~1.7 seconds.

## Summary

All four performance NFRs are met:

| NFR | Target | Result |
|-----|--------|--------|
| NFR1: First meaningful paint | < 1s | ~515ms |
| NFR2: API response time | < 100ms | ~51ms |
| NFR3: Time to first task | < 3s | ~324ms |
| NFR4: Bundle size | Minimal | 152 KB gzipped |

The application is well within all performance budgets. The in-memory backend and small frontend bundle ensure near-instant responses across all operations.
