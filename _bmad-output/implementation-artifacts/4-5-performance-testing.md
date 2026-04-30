# Story 4.5: Performance Testing

Status: done

## Story

As a **developer**,
I want automated performance tests and a documented performance report,
so that I can verify the app meets its performance targets.

## Acceptance Criteria

1. **Given** the app is loaded **When** I measure time to first meaningful paint **Then** it is under 1 second (NFR1)

2. **Given** a task CRUD operation **When** I measure API response time **Then** it is under 100ms (NFR2)

3. **Given** the page has loaded **When** I measure time to add the first task **Then** it is under 3 seconds from page load (NFR3)

4. **Given** the frontend build **When** I inspect the bundle **Then** it has no unnecessary heavy dependencies beyond React and Chakra UI (NFR4)

5. **Given** the performance tests **When** they complete **Then** a performance report is saved documenting the results

## Tasks / Subtasks

- [x] Task 1: Create performance E2E test using Playwright (AC: #1, #2, #3)
  - [x] Create `e2e/performance.spec.ts`
  - [x] Test: page load time ~515ms < 1000ms target
  - [x] Test: API response time ~51ms < 100ms target
  - [x] Test: time from page load to first task added ~324ms < 3000ms target
- [x] Task 2: Verify bundle size (AC: #4)
  - [x] Bundle: 530.96 KB raw / 152.01 KB gzipped — React + Chakra UI, no unnecessary deps
  - [x] Documented in performance report
- [x] Task 3: Create performance report document (AC: #5)
  - [x] Created `docs/performance-report.md` with measured results and analysis
- [x] Task 4: Verify all tests pass
  - [x] 12 E2E tests pass (5 tasks + 4 accessibility + 3 performance)
  - [x] All unit tests pass (31 backend + 30 frontend)
  - [x] Lint clean

## Dev Notes

### Playwright CDP Performance Metrics

Playwright can access Chrome DevTools Protocol metrics directly, which is the most reliable way to measure page performance in an automated test:

```typescript
import { test, expect } from '@playwright/test'

test('page loads within performance budget', async ({ page }) => {
  const client = await page.context().newCDPSession(page)
  await client.send('Performance.enable')

  await page.goto('/')
  await page.waitForSelector('[aria-label="Add a new task"]')

  const { metrics } = await client.send('Performance.getMetrics')
  const domContentLoaded = metrics.find(m => m.name === 'DomContentLoaded')
  // Assert timing metric exists and is reasonable
})
```

**Simpler alternative:** Just measure wall-clock time from `page.goto` to element visibility. This is less precise than CDP metrics but sufficient for this app's performance budget (< 1s is a generous target for a small React SPA).

```typescript
test('page loads under 1 second', async ({ page }) => {
  const start = Date.now()
  await page.goto('/')
  await page.waitForSelector('[aria-label="Add a new task"]')
  const loadTime = Date.now() - start
  expect(loadTime).toBeLessThan(1000)
})
```

### API Response Time Measurement

Use Playwright's `page.request` to measure API latency directly:

```typescript
test('API responds under 100ms', async ({ page }) => {
  const start = Date.now()
  await page.request.post('/api/tasks', { data: { text: 'Perf test' } })
  const elapsed = Date.now() - start
  expect(elapsed).toBeLessThan(100)
})
```

### Bundle Size Check

The Vite build output shows bundle size. Current output is ~530KB (gzipped ~152KB). This is dominated by React + Chakra UI — no unnecessary heavy dependencies. Document this in the performance report.

### Performance Report

Create `docs/performance-report.md` documenting:
- Page load time (measured)
- API response times (measured)
- Time to first task added (measured)
- Bundle size breakdown (from Vite build output)
- Conclusion: all NFRs met or not

### What NOT To Do

- Do NOT install Lighthouse as a dependency — CDP metrics and wall-clock timing are sufficient
- Do NOT add performance thresholds that fail CI — document results, don't gate builds
- Do NOT modify source code — this story only creates test and report files
- Do NOT use generous timeouts to make tests pass — if they fail, the performance is actually bad

### Previous Story Learnings

- Story 4.3: Playwright E2E tests use `beforeEach` to clear tasks via API
- Story 4.4: axe-core accessibility tests use same Playwright setup
- Story 4.3: `reuseExistingServer: true` allows running against already-started servers
- Playwright config at root with `workers: 1` for sequential execution

### References

- [Source: _bmad-output/planning-artifacts/prd.md — NFR1, NFR2, NFR3, NFR4]
- [Source: _bmad-output/planning-artifacts/architecture.md — Performance Requirements]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Used wall-clock timing (Date.now) rather than CDP metrics — simpler and sufficient for generous performance budgets
- API test uses Playwright's page.request.post for direct HTTP measurement
- Page load measured from goto to input element visibility

### Completion Notes List

- All 5 acceptance criteria satisfied
- NFR1: Page load ~515ms < 1000ms target
- NFR2: API response ~51ms < 100ms target
- NFR3: First task added ~324ms < 3000ms target
- NFR4: Bundle 152KB gzipped — no unnecessary heavy deps
- Performance report at docs/performance-report.md
- 12 E2E tests total (was 9, added 3 performance), all passing

### File List

- e2e/performance.spec.ts (new — 3 performance E2E tests)
- docs/performance-report.md (new — performance results and analysis)

## Change Log

- 2026-04-30: Story implemented — 3 performance E2E tests, performance report documenting all NFR results
