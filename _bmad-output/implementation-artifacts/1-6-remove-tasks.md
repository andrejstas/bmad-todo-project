# Story 1.6: Remove Tasks

Status: review

## Story

As a **user**,
I want to remove tasks I no longer need,
so that my list stays clean and relevant.

## Acceptance Criteria

1. **Given** a task exists **When** I hover over the task row **Then** a delete icon (IconButton) fades in

2. **Given** a task exists **When** I focus the task row via keyboard **Then** the delete icon becomes visible

3. **Given** tasks are at rest (not hovered or focused) **When** I view the list **Then** no delete icons are visible (progressive disclosure)

4. **Given** the delete icon is visible **When** I click it **Then** the task is removed immediately via API call with optimistic update — no confirmation dialog

5. **Given** I remove the last remaining task **When** the list becomes empty **Then** the empty state is displayed (input field with placeholder)

6. **Given** I remove a task **When** the UI updates **Then** the progress counter reflects the updated counts

7. **Given** the delete button **When** I inspect its accessibility **Then** it has `aria-label="Delete task: {task text}"`

## Tasks / Subtasks

- [x] Task 1: Add delete task API and mutation hook (AC: #4)
  - [x] Add `deleteTaskApi(id)` function to `src/api/tasks.ts` — DELETE /api/tasks/:id
  - [x] Add `useDeleteTask()` mutation hook with optimistic update (remove from cache) and rollback
- [x] Task 2: Add delete button to TaskItem with progressive disclosure (AC: #1, #2, #3, #7)
  - [x] Add `onDelete` callback prop to TaskItem
  - [x] Add Chakra `IconButton` with close/trash icon
  - [x] Progressive disclosure: opacity 0 at rest, fades in on parent hover or button focus
  - [x] `aria-label="Delete task: {task text}"`
  - [x] Fade transition ~150ms
- [x] Task 3: Pass onDelete through TaskList (AC: #4)
  - [x] Add `onDelete` prop to TaskList interface
  - [x] Pass `onDelete` to each TaskItem
- [x] Task 4: Integrate delete in App.tsx (AC: #5, #6)
  - [x] Call `useDeleteTask()` in App and pass handler to TaskList
  - [x] Empty state (AC #5) already works — TaskList returns null when empty
  - [x] ProgressCounter (AC #6) already updates from cache
- [x] Task 5: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

### Review Findings

- [ ] [Review][Patch] Add `&:focus-within .delete-btn` CSS rule so keyboard focus on any element in the row reveals delete button [TaskItem.tsx]
- [x] [Review][Defer] `opacity: 0` button still clickable/focusable at rest — deferred, Epic 3 (accessibility)
- [x] [Review][Defer] Rapid double-delete race condition — deferred, task removed from DOM on optimistic update
- [x] [Review][Defer] Content-Type header sent on DELETE with no body — deferred, harmless

## Dev Notes

### Existing Code State

**`src/api/tasks.ts`** — Current state: has `apiFetch`, `Task`, `fetchTasks`, `createTaskApi`, `updateTaskApi`, `useTasks`, `useToggleTask`, `useCreateTask`. **Changes:** Add `deleteTaskApi` + `useDeleteTask`.

**`src/components/TaskItem.tsx`** — Current state:
```typescript
export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <HStack as="li" gap="12px" py="8px" px="4px">
      <Checkbox.Root checked={task.completed} onCheckedChange={() => onToggle(task.id, !task.completed)}>
        <Checkbox.HiddenInput aria-label={task.text} />
        <Checkbox.Control />
      </Checkbox.Root>
      <Text fontSize="16px" color={...} textDecoration={...}>{task.text}</Text>
    </HStack>
  )
}
```
**Changes:** Add `onDelete` prop + IconButton with progressive disclosure.

**`src/components/TaskList.tsx`** — Current state: accepts `tasks` and `onToggle`, splits into active/completed. **Changes:** Add `onDelete` prop, pass to TaskItem.

**`src/App.tsx`** — Current state: uses `useTasks`, `useToggleTask`. **Changes:** Add `useDeleteTask` and pass handler.

### Delete Mutation Pattern

```typescript
function deleteTaskApi(id: string): Promise<void> {
  return apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTaskApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.filter((t) => t.id !== id),
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

Note: `deleteTaskApi` returns `void` since the backend returns 204 No Content. The `apiFetch` already handles 204 by returning `undefined`.

### Progressive Disclosure Pattern

The delete button must:
- Be invisible at rest (opacity: 0)
- Fade in on parent `<li>` hover (opacity: 1)
- Be visible when the button itself has keyboard focus (opacity: 1)
- Use ~150ms CSS transition

**Implementation approach using CSS-in-JS:**
```tsx
<HStack
  as="li"
  css={{
    '& .delete-btn': { opacity: 0, transition: 'opacity 0.15s' },
    '&:hover .delete-btn, & .delete-btn:focus-visible': { opacity: 1 },
  }}
>
  {/* ...checkbox, text... */}
  <IconButton
    className="delete-btn"
    aria-label={`Delete task: ${task.text}`}
    // ...icon, styling
  />
</HStack>
```

This uses native CSS selectors via Chakra's `css` prop. It's the most reliable approach across Chakra versions.

### Delete Icon

Use Chakra's built-in `CloseButton` or a simple "X" character rendered inside `IconButton`. Check if `@chakra-ui/react` v3 exports `CloseButton` or if you need to use `IconButton` with a custom icon.

If Chakra v3 has `CloseButton`, use it directly. Otherwise use `IconButton` with:
```tsx
<IconButton size="sm" variant="ghost" aria-label={`Delete task: ${task.text}`}>
  <span aria-hidden="true">&times;</span>
</IconButton>
```

Or use a simple SVG X icon. Do NOT install any icon library — keep it minimal.

### TaskItem Updated Layout

```
<HStack as="li" css={progressive disclosure styles}>
  <Checkbox.Root ...>
    <Checkbox.HiddenInput aria-label={task.text} />
    <Checkbox.Control />
  </Checkbox.Root>
  <Text flex="1" ...>{task.text}</Text>     ← flex="1" to push delete button to right
  <IconButton className="delete-btn" .../>  ← delete button at far right
</HStack>
```

The Text needs `flex="1"` to fill available space and push the delete button to the right edge.

### Anti-Patterns to Avoid

- Do NOT add a confirmation dialog — UX spec says immediate removal
- Do NOT install an icon library (lucide, react-icons, etc.) — use a simple X character or CSS
- Do NOT create new files — only update existing ones
- Do NOT add focus management after deletion — that's Story 3.1 (keyboard navigation)
- Do NOT add animations on removal — transition animations are Story 2.2

### Previous Story Learnings

- `aria-label` goes on `Checkbox.HiddenInput`, not `Checkbox.Root` (fixed in 1.5 review)
- Optimistic updates follow: cancelQueries → getQueryData → setQueryData → return { previous } → onError rollback → onSettled invalidate
- Chakra v3 uses `Separator` not `Divider`
- `useRef` + `useEffect` more reliable than `autoFocus` for Chakra inputs
- `staleTime: 30_000` on useTasks reduces refetch frequency

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.6]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR5, UX-DR9]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Task Deletion Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md — Optimistic Update Pattern]

## Change Log

- 2026-04-29: Story implemented — delete task with optimistic update, progressive disclosure delete button with hover/focus fade-in

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Used CSS-in-JS via Chakra's `css` prop for progressive disclosure (hover/focus-visible selectors)
- Used simple "✕" character for delete icon — no icon library needed
- `deleteTaskApi` returns `void` since backend returns 204; `apiFetch` already handles 204

### Completion Notes List

- All 7 acceptance criteria satisfied
- Delete mutation with optimistic update (filter from cache) + rollback
- Progressive disclosure: delete button hidden at rest, fades in on hover/focus (150ms transition)
- Delete button: ghost variant, red (#FF3B30), aria-label="Delete task: {text}"
- Text takes flex="1" to push delete button to right edge
- Empty state works automatically (TaskList returns null when empty)
- ProgressCounter updates automatically from cache
- End-to-end verified: create → delete → empty list
- Lint clean, build clean, backend 27 tests pass (no regressions)

### File List

- packages/frontend/src/api/tasks.ts (modified — added deleteTaskApi + useDeleteTask)
- packages/frontend/src/components/TaskItem.tsx (modified — added onDelete prop, IconButton with progressive disclosure)
- packages/frontend/src/components/TaskList.tsx (modified — added onDelete prop passthrough)
- packages/frontend/src/App.tsx (modified — useDeleteTask integration)
