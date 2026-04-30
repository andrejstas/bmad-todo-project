# Story 7.1: Empty State, Loading State, and Error State UI

Status: done

## Story

As a **user**,
I want to see clear visual feedback when the task list is empty, loading, or when something goes wrong,
so that I always understand the current state of the application.

## Acceptance Criteria

1. **Given** no tasks exist **When** the page loads and the fetch completes **Then** a friendly empty-state message is displayed below the input field (e.g., "No tasks yet" or similar neutral text)

2. **Given** the app is fetching tasks on initial load **When** the API has not yet responded **Then** a brief loading indicator (spinner or text) is displayed in place of the task list

3. **Given** the initial task fetch fails **When** the error state is active **Then** an inline error message is displayed with a retry option

4. **Given** a mutation (create, toggle, delete, edit) fails **When** the optimistic update rolls back **Then** a brief, non-intrusive error message is displayed to inform the user the action failed

5. **Given** the empty state is visible **When** I use a screen reader **Then** the empty state text is accessible and the input field remains the primary call to action

6. **Given** the loading or error state is visible **When** I use keyboard navigation **Then** all interactive elements (retry button, input field) are reachable via Tab

## Design Override Note

The original UX spec and architecture explicitly called for no loading spinners, no error banners, and a minimal empty state (just the input field). This story deliberately overrides those decisions to improve UX polish. The implementation should remain minimal and non-intrusive — aligned with the app's calm, quiet aesthetic.

## Tasks / Subtasks

- [x] Task 1: Add empty state to TaskList (AC: #1, #5)
  - [x] When `tasks.length === 0`, render a `Text` element with a neutral message instead of returning `null`
  - [x] Use secondary text color `#6E6E73`, 16px, matching the app's typography
  - [x] Ensure the message is inside the card layout (below input, above where tasks would appear)
  - [x] Update ProgressCounter to continue returning `null` when empty (no change needed there)

- [x] Task 2: Add loading state to App (AC: #2, #6)
  - [x] Destructure `isPending` (or `isLoading`) and `isError` from `useTasks()` in App.tsx
  - [x] When `isPending` is true and there is no cached data, show a subtle loading indicator (Chakra `Spinner` size="sm" or a "Loading..." text)
  - [x] Place the loading indicator where the TaskList would render
  - [x] Loading should disappear as soon as data arrives

- [x] Task 3: Add fetch error state to App (AC: #3, #6)
  - [x] When `isError` is true and there is no cached data, show an inline error message
  - [x] Include a "Try again" button that calls `refetch()` from the query result
  - [x] Style with the app's danger color `#FF3B30` for the error text and a subtle button
  - [x] Error state replaces the task list area — input field remains visible above

- [x] Task 4: Add mutation error feedback (AC: #4)
  - [x] Use Chakra's `Toaster` / `toaster.create()` (Chakra v3 toast API) to show brief error toasts on mutation failure
  - [x] Add error callbacks to `useCreateTask`, `useToggleTask`, `useDeleteTask`, and `useUpdateText` in `api/tasks.ts`
  - [x] Toast should be non-intrusive: bottom position, auto-dismiss after 3 seconds, danger color scheme
  - [x] Message: "Something went wrong. Please try again." (generic, calm)

- [x] Task 5: Update tests (AC: #1-#6)
  - [x] Update `TaskList.test.tsx`: test that empty state message renders when tasks is `[]`
  - [x] Add test to `App.tsx` or create `App.test.tsx`: verify loading state shows when query is pending
  - [x] Add test: verify error state shows when query fails, and retry button triggers refetch
  - [x] Update existing TaskList test that checks `container.firstChild` is null for empty — it now renders content

## Dev Notes

### Architecture Context

- **State management**: TanStack React Query. The `useTasks()` hook already returns `isPending`, `isError`, `error`, and `refetch` — they're just not used in `App.tsx` today.
- **Optimistic updates**: All 4 mutations already have `onMutate`/`onError` rollback. The mutation error toast is additive — it fires in `onError` alongside the existing rollback logic.
- **Component library**: Chakra UI v3 (3.34.0). Uses Ark UI internally.

### Files to Modify

| File | Action | What Changes |
|---|---|---|
| `packages/frontend/src/components/TaskList.tsx` | UPDATE | Replace `return null` with empty state UI |
| `packages/frontend/src/App.tsx` | UPDATE | Destructure `isPending`/`isError`/`refetch`, add loading + error states |
| `packages/frontend/src/api/tasks.ts` | UPDATE | Add toast error callbacks to all 4 mutation `onError` handlers |
| `packages/frontend/src/main.tsx` | UPDATE | Add Chakra `Toaster` component at root level |
| `packages/frontend/src/components/TaskList.test.tsx` | UPDATE | Fix empty state test, add new empty state test |
| `packages/frontend/src/api/tasks.test.ts` | UPDATE | Test mutation onError toast calls |

### Files NOT to Create

Do NOT create new component files (e.g., `EmptyState.tsx`, `LoadingState.tsx`, `ErrorState.tsx`). The states are simple enough to inline in `TaskList.tsx` and `App.tsx`. Keep the flat component structure.

### Chakra v3 Toast API

Chakra v3 uses `createToaster` (re-exported from `@ark-ui/react/toast`). The pattern:

```typescript
// Create a toaster instance (e.g., in a shared file or at module level in tasks.ts):
import { createToaster } from '@chakra-ui/react'

export const toaster = createToaster({ placement: 'bottom-end', duration: 3000 })

// In main.tsx, render the Toaster component:
import { Toaster } from '@chakra-ui/react'
// Add <Toaster toaster={toaster} /> as a sibling to <App /> inside ChakraProvider

// In mutation onError:
toaster.create({
  title: 'Something went wrong. Please try again.',
  type: 'error',
})
```

The `Toaster` component and `createToaster` are both exported from `@chakra-ui/react`. The `Toaster` component needs the `toaster` instance passed as a prop.

### Styling Requirements

- Empty state text: `color="#6E6E73"`, `fontSize="16px"`, `textAlign="center"`, `py="24px"`
- Loading indicator: Chakra `Spinner` with `color="#007AFF"` centered, or simple "Loading..." text in secondary color
- Error message: `color="#FF3B30"` for text, standard Chakra `Button` for retry
- Toast: `type: 'error'`, bottom placement, 3s auto-dismiss
- All states must respect `prefers-reduced-motion` (Chakra handles this for Spinner by default)

### Testing Approach

- Use the existing `renderWithProviders` from `test-utils.tsx` which wraps with QueryClient + ChakraProvider
- Mock `fetch` to simulate loading (never resolve), error (reject), and empty (resolve with `[]`)
- For toast testing: mock the toaster or verify the `onError` callback is wired up

### Previous Story Patterns

- Co-located tests: `*.test.tsx` next to source files
- Vitest + Testing Library for component tests
- All components use Chakra primitives — no raw HTML or custom CSS
- Relative imports, no barrel files
- camelCase for files/variables, PascalCase for components

### References

- [Source: planning-artifacts/prd.md#FR8] — "User can see an empty state when no tasks exist"
- [Source: planning-artifacts/architecture.md#Error Handling] — Optimistic update pattern with onError rollback
- [Source: planning-artifacts/ux-design-specification.md#Empty & Loading States] — Original design (overridden by this story)
- [Source: planning-artifacts/architecture.md#Frontend Architecture] — TanStack Query for state management

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

### Completion Notes List

- Empty state: TaskList renders "No tasks yet" text with secondary color instead of returning null
- Loading state: App.tsx shows Chakra Spinner (size="sm", accent blue) while initial fetch is pending
- Error state: App.tsx shows "Failed to load tasks" with "Try again" button that calls refetch()
- Mutation errors: All 4 mutations (create, toggle, delete, update) now show toast via createToaster on failure
- Toaster instance created in api/tasks.ts, Toaster component rendered in main.tsx
- 35 tests pass (30 existing + 5 new in App.test.tsx), zero regressions

### Change Log

- 2026-04-30: Implemented empty, loading, and error states (Story 7.1)

### File List

- packages/frontend/src/components/TaskList.tsx (modified — empty state UI)
- packages/frontend/src/components/TaskList.test.tsx (modified — updated empty state test)
- packages/frontend/src/App.tsx (modified — loading/error states with isPending/isError/refetch)
- packages/frontend/src/App.test.tsx (new — 5 tests for loading, empty, error, retry, success)
- packages/frontend/src/api/tasks.ts (modified — toaster instance + toast calls in all mutation onError)
- packages/frontend/src/main.tsx (modified — Toaster component + toaster import)
