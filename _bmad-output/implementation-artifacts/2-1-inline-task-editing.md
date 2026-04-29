# Story 2.1: Inline Task Editing

Status: done

## Story

As a **user**,
I want to edit a task's text by clicking on it,
so that I can fix typos or clarify tasks without removing and re-adding them.

## Acceptance Criteria

1. **Given** a task exists in the list **When** I click on the task text **Then** the text becomes editable inline with a cursor at the click position

2. **Given** a task is in edit mode **When** I modify the text and press Enter **Then** the updated text is saved via API call with optimistic update and edit mode exits

3. **Given** a task is in edit mode **When** I modify the text and click away (blur) **Then** the updated text is saved via API call and edit mode exits

4. **Given** a task is in edit mode **When** I press Escape **Then** the text reverts to its original value and edit mode exits

5. **Given** a task is in edit mode **When** I clear all text and press Enter or blur **Then** the edit is treated as saving empty text — same validation as creation (revert if backend rejects)

6. **Given** a task is in edit mode **When** I look at the visual presentation **Then** there is no visible mode change beyond the text cursor appearing — no save/cancel buttons, no border change

7. **Given** a completed task exists **When** I click on its text **Then** I can edit it the same way as an active task

## Tasks / Subtasks

- [x] Task 1: Add useUpdateText mutation hook (AC: #2, #3)
  - [x] Add `useUpdateText()` to `src/api/tasks.ts` — reuses existing `updateTaskApi` with `{ text }` payload
  - [x] Optimistic update: map over tasks, replace text for matching id
  - [x] Rollback on error, invalidate on settle
- [x] Task 2: Add inline editing to TaskItem (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] Add `onEdit` callback prop to TaskItem: `(id: string, text: string) => void`
  - [x] Add local state: `isEditing` (boolean), `editText` (string)
  - [x] Click on Text → enter edit mode: set `isEditing=true`, `editText=task.text`
  - [x] Replace `Text` with borderless `Input` when editing — match Text styling exactly (no border, no bg, same font/color/size)
  - [x] Auto-focus the input when entering edit mode
  - [x] Enter → if text changed, call `onEdit(task.id, editText.trim())`, exit edit mode
  - [x] Blur → same as Enter (save and exit)
  - [x] Escape → revert `editText` to `task.text`, exit edit mode
  - [x] Empty text on save → call onEdit anyway (backend validates, optimistic rollback handles rejection)
  - [x] Completed tasks editable the same way (no special handling)
- [x] Task 3: Pass onEdit through TaskList (AC: #2, #3)
  - [x] Add `onEdit` prop to TaskList interface
  - [x] Pass `onEdit` to each TaskItem
- [x] Task 4: Integrate edit in App.tsx
  - [x] Call `useUpdateText()` in App and pass handler to TaskList
- [x] Task 5: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

### Review Findings

- [x] [Review][Patch] Guard empty text client-side in handleSave — FIXED: return early if trimmed is empty [TaskItem.tsx]
- [x] [Review][Defer] No keyboard entry to edit mode (Enter on focused text) — deferred, Story 3.1 (Keyboard Navigation)

## Dev Notes

### Existing Code State

**`src/api/tasks.ts`** — Has `updateTaskApi(id, { text?, completed? })` already. Only needs a new `useUpdateText` hook.

**`src/components/TaskItem.tsx`** — Current layout:
```
<HStack as="li" css={progressive disclosure}>
  <Checkbox.Root ... />
  <Text flex="1" fontSize="16px" color={...} textDecoration={...}>{task.text}</Text>
  <IconButton className="delete-btn" ... />
</HStack>
```
**Changes:** Text element becomes clickable → swaps to borderless Input in edit mode.

**`src/components/TaskList.tsx`** — Passes `onToggle` and `onDelete`. **Changes:** Also pass `onEdit`.

**`src/App.tsx`** — Uses `useTasks`, `useToggleTask`, `useDeleteTask`. **Changes:** Add `useUpdateText`.

### useUpdateText Mutation Pattern

```typescript
export function useUpdateText() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      updateTaskApi(id, { text }),
    onMutate: async ({ id, text }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, text } : t)),
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

### Inline Edit Implementation

The key UX requirement is "no visible mode change beyond the text cursor." This means the edit Input must be visually identical to the display Text.

**Edit mode Input styling:**
```typescript
<Input
  value={editText}
  onChange={(e) => setEditText(e.target.value)}
  onKeyDown={handleEditKeyDown}
  onBlur={handleSave}
  autoFocus
  variant="unstyled"        // no border, no bg
  fontSize="16px"
  color={task.completed ? '#6E6E73' : '#1D1D1F'}
  textDecoration={task.completed ? 'line-through' : 'none'}
  lineHeight="1.5"
  flex="1"
  p="0"
  h="auto"
/>
```

Use Chakra's `variant="unstyled"` (or equivalent in v3) to remove all input chrome. The input should look identical to the Text it replaces.

**State management in TaskItem:**
```typescript
const [isEditing, setIsEditing] = useState(false)
const [editText, setEditText] = useState('')

const startEditing = () => {
  setIsEditing(true)
  setEditText(task.text)
}

const handleSave = () => {
  setIsEditing(false)
  const trimmed = editText.trim()
  if (trimmed !== task.text) {
    onEdit(task.id, trimmed)
  }
}

const handleEditKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSave()
  } else if (e.key === 'Escape') {
    setIsEditing(false)
    setEditText(task.text)
  }
}
```

**CRITICAL:** The `onBlur` handler calls `handleSave`. Make sure `handleSave` is idempotent — it should not fire the mutation if the text hasn't changed.

**CRITICAL:** When in edit mode, the `Text` element is replaced by the `Input`. When not editing, clicking the `Text` calls `startEditing()`. The swap should be seamless visually.

### Chakra UI v3 Input variant="unstyled"

Check if Chakra v3 supports `variant="unstyled"` on Input. If not, use `variant="outline"` with explicit styling to remove borders:
```typescript
border="none"
bg="transparent"
outline="none"
boxShadow="none"
_focus={{ border: 'none', boxShadow: 'none' }}
```

### Cursor Position

AC1 says "cursor at the click position." With a React controlled Input replacing a Text element, achieving exact cursor position from a click is complex. The practical approach: auto-focus the input which places the cursor at the end. This is acceptable — most todo apps do this. Do NOT over-engineer cursor positioning.

### Anti-Patterns to Avoid

- Do NOT add save/cancel buttons — UX spec says no visible buttons
- Do NOT change borders or background on edit — "no visible mode change"
- Do NOT use `contentEditable` — use a standard Input for controlled behavior
- Do NOT create new files — only update existing ones
- Do NOT prevent editing completed tasks — they're editable too (AC #7)
- Do NOT add a separate "edit mode" visual indicator

### Previous Story Learnings

- `aria-label` goes on `Checkbox.HiddenInput`, not `Checkbox.Root`
- Progressive disclosure: `opacity: 0` with hover/focus-within/focus-visible reveals
- `updateTaskApi` already exists and handles PATCH with `{ text }` — reuse it
- Optimistic update pattern: cancelQueries → snapshot → setQueryData → return { previous } → onError rollback → onSettled invalidate

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR14, UX-DR5 (edit state)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Task Edit Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md — Optimistic Update Pattern]

## Change Log

- 2026-04-29: Story implemented — inline task editing with click-to-edit, Enter/blur save, Escape revert, borderless input matching text styling

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Used `variant="flushed"` with `border="none"` + `bg="transparent"` for invisible input chrome
- `handleSave` checks `isEditing` flag to prevent double-fire from Enter triggering blur
- Auto-focus via `useRef` + `useEffect` on `isEditing` state change
- Empty text edit sends to API which returns 400 → optimistic rollback restores original text

### Completion Notes List

- All 7 acceptance criteria satisfied
- `useUpdateText` mutation with optimistic update + rollback (reuses `updateTaskApi`)
- TaskItem: click text → borderless Input, Enter/blur saves, Escape reverts
- No visible mode change beyond cursor — input matches Text styling exactly
- Completed tasks editable the same way (same component logic)
- End-to-end verified: edit text works (200), empty text rejected (400 → rollback)
- Lint clean, build clean, backend 27 tests pass (no regressions)

### File List

- packages/frontend/src/api/tasks.ts (modified — added useUpdateText)
- packages/frontend/src/components/TaskItem.tsx (modified — inline editing state + UI)
- packages/frontend/src/components/TaskList.tsx (modified — added onEdit prop)
- packages/frontend/src/App.tsx (modified — useUpdateText integration)
