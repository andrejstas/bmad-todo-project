# Story 1.4: Add Tasks & View Task List

Status: done

## Story

As a **user**,
I want to add tasks and see them in a list,
so that I can capture what I need to do and see everything at a glance.

## Acceptance Criteria

1. **Given** the page loads **When** I look at the interface **Then** the input field is visible, auto-focused, with placeholder "What are you working on?" and `#F2F2F7` background with subtle inset shadow

2. **Given** the input is focused **When** I type "Buy milk" and press Enter **Then** the task appears in the list below with an unchecked checkbox and the task text

3. **Given** I just added a task **When** it appears in the list **Then** the input field clears and retains focus for rapid entry

4. **Given** I press Enter with empty or whitespace-only text **When** the submission is processed **Then** nothing happens — silently ignored, no error indication

5. **Given** no tasks exist **When** I view the app **Then** I see only the input field with placeholder (empty state — no illustrations, no onboarding text)

6. **Given** multiple tasks are added **When** I view the list **Then** all tasks are displayed in a `ul` with `role="list"`, each task as a `li` element

7. **Given** I add a task **When** the mutation fires **Then** TanStack Query performs an optimistic update (task appears immediately) with rollback on API failure

8. **Given** one or more tasks exist **When** I look at the progress counter **Then** it displays "{completed} of {total} done" in 14px medium weight `#6E6E73`

9. **Given** no tasks exist **When** I look for the progress counter **Then** it is not rendered

10. **Given** the input field **When** I check its accessibility **Then** it has `aria-label="Add a new task"`

## Tasks / Subtasks

- [x] Task 1: Create Task type and API client (AC: #7)
  - [x] Create `src/api/client.ts` — thin fetch helper with base URL and JSON headers
  - [x] Define frontend `Task` interface in `src/api/tasks.ts` (duplicate of backend, per architecture)
  - [x] Create `fetchTasks()` — GET /api/tasks
  - [x] Create `createTask(text)` — POST /api/tasks
  - [x] Create `useTasks()` — TanStack Query `useQuery` hook wrapping fetchTasks
  - [x] Create `useCreateTask()` — TanStack Query `useMutation` with optimistic update and rollback
- [x] Task 2: Create TaskInput component (AC: #1, #2, #3, #4, #10)
  - [x] Create `src/components/TaskInput.tsx`
  - [x] Chakra `Input` with placeholder "What are you working on?", #F2F2F7 bg, inset shadow
  - [x] Auto-focus on mount via `autoFocus` or `useRef`
  - [x] Submit on Enter: call `useCreateTask()` mutation
  - [x] Clear input and retain focus after successful submit
  - [x] Silently ignore empty/whitespace-only submissions
  - [x] `aria-label="Add a new task"`
- [x] Task 3: Create TaskItem component (AC: #2, #6)
  - [x] Create `src/components/TaskItem.tsx`
  - [x] Render as `li` element
  - [x] HStack with Checkbox (unchecked, visual only for now) + Text showing task text
  - [x] Checkbox `aria-label` set to task text
  - [x] 16px font, #1D1D1F color
- [x] Task 4: Create ProgressCounter component (AC: #8, #9)
  - [x] Create `src/components/ProgressCounter.tsx`
  - [x] Display "{completed} of {total} done" — 14px, medium weight, #6E6E73
  - [x] Hidden when no tasks exist (return null)
  - [x] `aria-live="polite"` for screen reader announcements
- [x] Task 5: Create TaskList component (AC: #5, #6)
  - [x] Create `src/components/TaskList.tsx`
  - [x] Render as `ul` with `role="list"`
  - [x] Map tasks to TaskItem components
  - [x] Empty state: render nothing (just input visible)
- [x] Task 6: Integrate components in App.tsx (AC: #1-10)
  - [x] Update App.tsx VStack to include: ProgressCounter, TaskInput, TaskList
  - [x] Pass tasks data from `useTasks()` to components
  - [x] Preserve existing card layout (heading, card shell, main landmark)
- [x] Task 7: Verify end-to-end functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

### Review Findings

- [x] [Review][Patch] Checkbox.Root needs noop `onCheckedChange` — FIXED [TaskItem.tsx]
- [x] [Review][Patch] `useTasks` query needs `staleTime` — FIXED: 30s staleTime [api/tasks.ts]
- [x] [Review][Patch] `listStyleType="none"` on `ul` parent — FIXED [TaskList.tsx, TaskItem.tsx]
- [x] [Review][Defer] `apiFetch` header merge bug if caller passes custom headers — deferred, no callers use custom headers
- [x] [Review][Defer] No `e.preventDefault()` on Enter key — deferred, no form wrapping exists

## Dev Notes

### Existing Code State

**`src/App.tsx`** — Current: Floating card with `<Heading as="h1">Tasks</Heading>` inside a VStack. **Changes:** Add ProgressCounter, TaskInput, and TaskList components inside the VStack below the heading.

**`src/main.tsx`** — Has ChakraProvider + QueryClientProvider. **No changes needed.**

**`src/theme/index.ts`** — Has all design tokens. **No changes needed.**

### Architecture: API Client Pattern

Use plain `fetch` with a thin helper — do NOT install axios.

**`src/api/client.ts`:**
```typescript
const API_BASE = '/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}
```

### Architecture: TanStack Query Hooks

**Query key:** `['tasks']` for all task queries.

**`useTasks()`:** Standard useQuery wrapping GET /api/tasks.

**`useCreateTask()`:** useMutation with optimistic update pattern:
```typescript
const queryClient = useQueryClient()

return useMutation({
  mutationFn: (text: string) => createTask(text),
  onMutate: async (text) => {
    await queryClient.cancelQueries({ queryKey: ['tasks'] })
    const previous = queryClient.getQueryData<Task[]>(['tasks'])
    queryClient.setQueryData<Task[]>(['tasks'], (old = []) => [
      ...old,
      { id: crypto.randomUUID(), text, completed: false, createdAt: new Date().toISOString() }
    ])
    return { previous }
  },
  onError: (_err, _text, context) => {
    if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})
```

### Architecture: Component Structure

```
src/components/
├── TaskInput.tsx        # Input for adding tasks
├── TaskItem.tsx         # Single task row (checkbox + text)
├── TaskList.tsx         # List container (ul)
└── ProgressCounter.tsx  # "{completed} of {total} done"
src/api/
├── client.ts            # Fetch helper
└── tasks.ts             # Task type + TanStack Query hooks
```

### Frontend Task Type

Duplicate the backend Task interface in the frontend (architecture decision — no shared package):
```typescript
export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: string
}
```

### Component Details

**TaskInput:**
- Chakra `Input` component
- `bg="#F2F2F7"`, `boxShadow="inset 0 1px 2px rgba(0,0,0,0.05)"`
- `placeholder="What are you working on?"`
- `aria-label="Add a new task"`
- `autoFocus` for focus on mount
- `onKeyDown` handler: on Enter, trim text, if non-empty call mutation then clear
- Controlled input with `useState`

**TaskItem:**
- Renders as `<Box as="li">` (or `<li>`)
- `HStack` layout: Checkbox + Text
- Checkbox is visual only in this story — `checked={task.completed}`, `readOnly` (toggle comes in Story 1.5)
- Checkbox `aria-label={task.text}`
- Text: 16px, #1D1D1F color
- No delete button (Story 1.6)

**ProgressCounter:**
- Only renders when `tasks.length > 0`
- Text: `{completed} of {total} done`
- Style: 14px, medium weight (500), #6E6E73
- `aria-live="polite"` on the Text element

**TaskList:**
- `VStack` rendered as `<ul>` with `role="list"`
- Maps tasks array to TaskItem components with `key={task.id}`
- No rendering when empty (empty state is just the input)

### Chakra UI v3 Notes

- Use `Checkbox.Root` + `Checkbox.HiddenInput` + `Checkbox.Control` pattern if Chakra v3 requires it, OR use the simpler `Checkbox` if available as a single component. Check the installed version's exports.
- `Separator` replaces `Divider` (not needed in this story, but for reference)
- Responsive props use object syntax: `{{ base: '...', md: '...' }}`

### Testing Notes

This story is primarily UI components. The story spec does not require unit tests for UI components (those come in Story 4.2). Focus on:
- Lint passing
- Build passing
- No backend regressions
- Manual verification that the app works end-to-end

### Anti-Patterns to Avoid

- Do NOT install axios — use plain fetch
- Do NOT create barrel files (index.ts) in api/ or components/
- Do NOT add error toasts or error UI — silent rollback per UX spec
- Do NOT implement checkbox toggle — that's Story 1.5
- Do NOT implement delete button — that's Story 1.6
- Do NOT add loading spinners — backend is near-instant per UX spec
- Do NOT use `useEffect` for auto-focus — use `autoFocus` prop or `ref` with focus in mount effect
- Do NOT pass queryClient as prop — use `useQueryClient()` hook inside mutations

### Previous Story Learnings

- Chakra UI v3 uses `defineConfig` + `createSystem`, `ChakraProvider` with `value` prop
- Frontend uses `moduleResolution: "bundler"` — does NOT need `.js` extensions on imports
- `corepack yarn` must be used instead of bare `yarn`
- All design tokens defined in `src/theme/index.ts` (colors, fonts, spacing, radii, shadows)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Optimistic Update Pattern]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — TaskInput Component]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — TaskItem Component]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — ProgressCounter Component]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — TaskList Component]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.4]

## Change Log

- 2026-04-29: Story implemented — API client, TanStack Query hooks with optimistic updates, TaskInput/TaskItem/TaskList/ProgressCounter components, App.tsx integration

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Used Chakra UI v3 `Checkbox.Root` + `Checkbox.HiddenInput` + `Checkbox.Control` compound component pattern
- Optimistic update uses `crypto.randomUUID()` for temporary client-side IDs
- Used `useRef` + `useEffect` for auto-focus instead of `autoFocus` prop (more reliable with Chakra)
- Bundle size increased to 525KB (from 473KB) due to TanStack Query — advisory warning only

### Completion Notes List

- All 10 acceptance criteria satisfied
- API client with thin fetch wrapper (no axios)
- TanStack Query hooks: useTasks (query) + useCreateTask (mutation with optimistic update + rollback)
- 4 components: TaskInput, TaskItem, TaskList, ProgressCounter
- End-to-end verified: frontend creates tasks through Vite proxy to backend API
- Lint clean, build clean, backend 27 tests pass (no regressions)

### File List

- packages/frontend/src/api/client.ts (new)
- packages/frontend/src/api/tasks.ts (new)
- packages/frontend/src/components/TaskInput.tsx (new)
- packages/frontend/src/components/TaskItem.tsx (new)
- packages/frontend/src/components/TaskList.tsx (new)
- packages/frontend/src/components/ProgressCounter.tsx (new)
- packages/frontend/src/App.tsx (modified — integrated all components)
