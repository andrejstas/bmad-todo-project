# Story 1.5: Complete & Uncomplete Tasks with Progress Tracking

Status: done

## Story

As a **user**,
I want to check off tasks as I complete them,
so that I can track my progress and see what's left to do.

## Acceptance Criteria

1. **Given** an active task exists **When** I click its checkbox **Then** it is marked as complete via API call with optimistic update

2. **Given** a task is completed **When** I view it **Then** it displays strikethrough text in secondary color (`#6E6E73`)

3. **Given** both active and completed tasks exist **When** I view the list **Then** active tasks appear above completed tasks, separated by a Chakra `Separator`

4. **Given** a completed task exists **When** I click its checkbox again **Then** it toggles back to active and moves to the active section

5. **Given** I complete a task **When** the UI updates **Then** the progress counter reflects the new count (e.g., "2 of 5 done")

6. **Given** all tasks are complete **When** I view the progress counter **Then** it shows "{total} of {total} done"

7. **Given** only completed tasks exist (no active tasks) **When** I view the list **Then** completed tasks are shown without a divider

8. **Given** only active tasks exist (no completed tasks) **When** I view the list **Then** active tasks are shown without a divider

9. **Given** a task's checkbox **When** I inspect its accessibility **Then** it has `aria-label` set to the task text

## Tasks / Subtasks

- [x] Task 1: Add toggle task API and mutation hook (AC: #1, #4)
  - [x] Add `updateTaskApi(id, updates)` function to `src/api/tasks.ts` — PATCH /api/tasks/:id
  - [x] Add `useToggleTask()` mutation hook with optimistic update and rollback
- [x] Task 2: Wire checkbox toggle in TaskItem (AC: #1, #2, #4, #9)
  - [x] Update `TaskItem` to accept an `onToggle` callback prop
  - [x] Replace noop `onCheckedChange` with actual toggle call
  - [x] Add completed styling: strikethrough text decoration + #6E6E73 color when `task.completed`
  - [x] Preserve `aria-label={task.text}` on checkbox
- [x] Task 3: Split TaskList into active/completed sections (AC: #3, #7, #8)
  - [x] Update `TaskList` to separate tasks into active and completed arrays
  - [x] Render active tasks section above completed tasks section
  - [x] Add Chakra `Separator` between sections — only when BOTH sections have items
  - [x] No divider when only one section has items
- [x] Task 4: Integrate toggle in App.tsx (AC: #5, #6)
  - [x] Call `useToggleTask()` in App and pass toggle handler to TaskList/TaskItem
  - [x] Verify ProgressCounter updates automatically (it reads from useTasks cache)
- [x] Task 5: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

### Review Findings

- [x] [Review][Patch] Move `aria-label` to Checkbox.HiddenInput for explicit accessibility — FIXED [TaskItem.tsx]
- [x] [Review][Defer] Rapid double-click race condition on checkbox toggle — deferred, theoretical edge case resolved by onSettled refetch

## Dev Notes

### Existing Code State

**`src/api/tasks.ts`** — Current state:
- Has `Task` interface, `fetchTasks()`, `createTaskApi()`, `useTasks()`, `useCreateTask()`
- **Changes:** Add `updateTaskApi()` and `useToggleTask()` mutation

**`src/components/TaskItem.tsx`** — Current state:
```typescript
export function TaskItem({ task }: TaskItemProps) {
  return (
    <HStack as="li" gap="12px" py="8px" px="4px">
      <Checkbox.Root checked={task.completed} onCheckedChange={() => {}} aria-label={task.text}>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
      <Text fontSize="16px" color="#1D1D1F" lineHeight="1.5">{task.text}</Text>
    </HStack>
  )
}
```
**Changes:** Accept `onToggle` prop, wire `onCheckedChange`, add completed styling.

**`src/components/TaskList.tsx`** — Current state: flat list rendering all tasks without sections.
**Changes:** Split into active/completed, add Separator.

**`src/App.tsx`** — Current state: uses `useTasks()`, passes tasks to ProgressCounter, TaskInput, TaskList.
**Changes:** Add `useToggleTask()`, pass toggle handler through.

### Toggle Mutation Pattern

Follow the same optimistic update pattern as `useCreateTask()`:

```typescript
function updateTaskApi(id: string, updates: { completed?: boolean; text?: string }): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTaskApi(id, { completed }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, completed } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

### TaskItem Completed Styling

When `task.completed` is true:
- Text: `textDecoration="line-through"`, `color="#6E6E73"` (secondary)
- When false: `textDecoration="none"`, `color="#1D1D1F"` (primary)

### TaskList Section Split

```typescript
const active = tasks.filter((t) => !t.completed)
const completed = tasks.filter((t) => t.completed)

// Render: active section, then Separator (if both have items), then completed section
```

**CRITICAL:** Use Chakra v3 `Separator` — NOT `Divider` (which was renamed in v3).

```typescript
import { Separator } from '@chakra-ui/react'

{active.length > 0 && completed.length > 0 && <Separator />}
```

### Component Props Flow

```
App.tsx
  → useTasks() → tasks[]
  → useToggleTask() → toggleTask.mutate({ id, completed })
  → <TaskList tasks={tasks} onToggle={(id, completed) => toggleTask.mutate({ id, completed })} />
      → <TaskItem task={task} onToggle={onToggle} />
          → Checkbox.Root onCheckedChange → onToggle(task.id, !task.completed)
```

### ProgressCounter — No Changes Needed

ProgressCounter already computes `completed` and `total` from the tasks array and displays "{completed} of {total} done". Since it reads from the same `useTasks()` query cache, it updates automatically when toggle mutations fire optimistic updates.

### Anti-Patterns to Avoid

- Do NOT use `Divider` — it's renamed to `Separator` in Chakra v3
- Do NOT create new files — only update existing ones
- Do NOT add section labels ("Active", "Completed") — UX spec says no labels, just a divider
- Do NOT add animations — transition animations are Story 2.2
- Do NOT add delete button — that's Story 1.6
- Do NOT modify ProgressCounter — it already works correctly

### Previous Story Learnings

- Chakra v3 `Checkbox.Root` needs `onCheckedChange` callback (not `readOnly`)
- `useTasks()` has `staleTime: 30_000` to reduce refetches
- `listStyleType="none"` is on the `ul` parent (TaskList), not on individual `li` items
- All optimistic updates follow: cancelQueries → getQueryData → setQueryData → return { previous } → onError rollback → onSettled invalidate

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.5]
- [Source: _bmad-output/planning-artifacts/architecture.md — Optimistic Update Pattern]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Task Completion Flow]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR5, UX-DR7]

## Change Log

- 2026-04-29: Story implemented — toggle task completion with optimistic updates, active/completed sections with Separator, strikethrough styling

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Used Chakra v3 `Separator` (not `Divider`) between active/completed sections
- `useToggleTask` follows same optimistic pattern as `useCreateTask`
- `updateTaskApi` is reusable for future text editing (Story 2.1)

### Completion Notes List

- All 9 acceptance criteria satisfied
- Toggle mutation with optimistic update + rollback
- Completed tasks: strikethrough + #6E6E73 color
- Active/completed sections separated by Separator (only when both have items)
- ProgressCounter updates automatically via query cache
- End-to-end verified: create → toggle → toggle back works through API
- Lint clean, build clean, backend 27 tests pass (no regressions)

### File List

- packages/frontend/src/api/tasks.ts (modified — added updateTaskApi + useToggleTask)
- packages/frontend/src/components/TaskItem.tsx (modified — onToggle prop, completed styling)
- packages/frontend/src/components/TaskList.tsx (modified — active/completed sections + Separator)
- packages/frontend/src/App.tsx (modified — useToggleTask integration)
