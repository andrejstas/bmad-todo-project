# Story 3.1: Keyboard Navigation & Focus Management

Status: done

## Story

As a **keyboard-only user**,
I want to perform all task operations without a mouse,
so that I can use the app fully with keyboard navigation.

## Acceptance Criteria

1. **Given** the page loads **When** I start tabbing **Then** focus moves in logical order: input field → first task checkbox → first task text → first task delete → next task... and so on

2. **Given** the input field is focused **When** I type text and press Enter **Then** the task is created and focus remains on the input field

3. **Given** a task checkbox is focused **When** I press Space **Then** the task completion state toggles

4. **Given** a task's text is focused **When** I press Enter **Then** inline edit mode activates

5. **Given** a task is in edit mode **When** I press Escape **Then** edit mode exits and the text reverts to original

6. **Given** a task's delete button is focused **When** I press Enter or Space **Then** the task is removed and focus moves to the next task in the list

7. **Given** I delete the last task in the list **When** the list becomes empty **Then** focus moves to the input field

8. **Given** any interactive element is focused **When** I look at the focus indicator **Then** a custom focus ring is visible: 2px solid `#007AFF` with offset — clearly visible on both white and off-white backgrounds

9. **Given** all interactive elements on the page **When** I tab through the entire interface **Then** every element is reachable and operable — no mouse-only interactions exist

## Tasks / Subtasks

- [x] Task 1: Add custom focus ring via theme globalCss (AC: #8)
  - [x] Add `globalCss` to the Chakra theme `defineConfig` with `*:focus-visible` rule
  - [x] Set `outline: '2px solid #007AFF'`, `outlineOffset: '2px'`, `boxShadow: 'none'`
  - [x] Verify focus ring visible on input, checkbox, delete button, and task text
- [x] Task 2: Make task text tabbable and keyboard-editable (AC: #1, #4, #9)
  - [x] Add `tabIndex={0}` to the Text element in TaskItem (non-editing mode only)
  - [x] Add `onKeyDown` handler to Text: Enter key calls `startEditing()`
  - [x] This resolves the deferred item from story 2.1 review: "No keyboard entry to edit mode"
- [x] Task 3: Focus management after task deletion (AC: #6, #7)
  - [x] Add `data-task-id={task.id}` to each TaskItem's HStack
  - [x] Add a ref (`listRef`) to TaskList's `ul` element (VStack)
  - [x] Create `handleDeleteWithFocus` wrapper in TaskList that:
    1. Finds the index of the task being deleted in the rendered DOM
    2. Calls `onDelete(id)`
    3. After `requestAnimationFrame`, focuses the next task's first focusable child
    4. If the list is empty, focuses the input via `document.querySelector('[aria-label="Add a new task"]')`
### Review Findings

- [x] [Review][Patch] Guard against negative index in handleDeleteWithFocus when task not found in DOM — FIXED: `index < 0 ? 0 : Math.min(index, ...)` [TaskList.tsx]

- [x] Task 4: Verify existing keyboard behaviors still work (AC: #2, #3, #5)
  - [x] AC #2: Enter in TaskInput creates task and retains focus (already implemented)
  - [x] AC #3: Space on Checkbox toggles completion (Chakra built-in)
  - [x] AC #5: Escape in edit mode reverts text (already implemented)
  - [x] Verify no regressions after changes
- [x] Task 5: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

## Dev Notes

### Existing Code State — What Already Works

These ACs are already satisfied by existing code and should NOT be reimplemented:

- **AC #2** — TaskInput: `handleKeyDown` checks `e.key === 'Enter'`, creates task, clears input, re-focuses via `inputRef.current?.focus()`
- **AC #3** — Checkbox.Root: `onCheckedChange` toggles completion. Chakra's Checkbox handles Space natively.
- **AC #5** — TaskItem: `handleEditKeyDown` checks `e.key === 'Escape'`, reverts `editText`, exits edit mode

### Existing Code State — What Needs Changes

**`src/components/TaskItem.tsx`** — Current text element is click-only:
```tsx
<Text
  flex="1"
  fontSize="16px"
  color={task.completed ? '#6E6E73' : '#1D1D1F'}
  lineHeight="1.5"
  textDecoration={task.completed ? 'line-through' : 'none'}
  cursor="text"
  onClick={startEditing}
>
  {task.text}
</Text>
```
- Text is a `<p>` tag — NOT tabbable, NOT keyboard-activatable
- Only `onClick` triggers edit mode — mouse-only interaction
- **Fix:** Add `tabIndex={0}` and `onKeyDown` for Enter key
- The `cursor="text"` already hints at editability visually

**`src/components/TaskList.tsx`** — No focus management:
```tsx
<VStack as="ul" role="list" gap="0" align="stretch" p="0" m="0" listStyleType="none">
  {active.map(...)}
  {completed.map(...)}
</VStack>
```
- No refs, no focus management after deletion
- Delete button click removes task, but focus is lost (goes to body)
- **Fix:** Add ref to `ul`, add `data-task-id` to TaskItems, implement focus redirection after deletion

**`src/theme/index.ts`** — No custom focus styles:
- Browser default focus ring (usually blue dotted outline) is in use
- **Fix:** Add `globalCss` to theme config for consistent `#007AFF` focus ring

### Implementation — Theme Focus Ring (Task 1)

Add `globalCss` to the `defineConfig` call in `theme/index.ts`:

```typescript
const config = defineConfig({
  globalCss: {
    '*:focus-visible': {
      outline: '2px solid #007AFF',
      outlineOffset: '2px',
      boxShadow: 'none',
    },
  },
  theme: {
    tokens: { ... }
  },
})
```

`:focus-visible` only shows on keyboard navigation (not mouse clicks) — correct behavior per UX spec.

### Implementation — Tabbable Text (Task 2)

Add keyboard support to the Text element in TaskItem:

```tsx
const handleTextKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    startEditing()
  }
}

// In render:
<Text
  tabIndex={0}
  onKeyDown={handleTextKeyDown}
  onClick={startEditing}
  // ... existing props
>
```

This makes the text focusable via Tab and activatable via Enter. The existing `cursor="text"` provides visual affordance.

### Implementation — Focus After Deletion (Task 3)

In TaskList, add a ref and focus management wrapper:

```tsx
const listRef = useRef<HTMLDivElement>(null)

const handleDeleteWithFocus = (id: string) => {
  const listEl = listRef.current
  if (!listEl) { onDelete(id); return }

  const items = Array.from(listEl.querySelectorAll<HTMLElement>('[data-task-id]'))
  const index = items.findIndex(el => el.dataset.taskId === id)

  onDelete(id)

  requestAnimationFrame(() => {
    const newItems = Array.from(listEl.querySelectorAll<HTMLElement>('[data-task-id]'))
    if (newItems.length === 0) {
      document.querySelector<HTMLElement>('[aria-label="Add a new task"]')?.focus()
      return
    }
    const targetIndex = Math.min(index, newItems.length - 1)
    const focusable = newItems[targetIndex]?.querySelector<HTMLElement>('input, button, [tabindex="0"]')
    focusable?.focus()
  })
}
```

**Key details:**
- `data-task-id={task.id}` added to each TaskItem's HStack — enables DOM querying
- `requestAnimationFrame` waits for React to re-render after optimistic update
- Focus targets the first focusable element (checkbox input) of the next task at the same position
- If list empties, falls back to the input field using its `aria-label` selector
- TaskList needs to import `useRef` from React
- Pass `handleDeleteWithFocus` instead of `onDelete` to each TaskItem

### Tab Order Verification

After changes, the natural DOM tab order should be:
1. TaskInput (`<input>` — auto-focused on load)
2. First task's checkbox (`Checkbox.HiddenInput` — tabbable)
3. First task's text (`<p tabIndex={0}>` — now tabbable)
4. First task's delete button (`<button>` — tabbable, visible on `:focus-visible`)
5. Second task's checkbox → text → delete → ...
6. Completed section tasks follow the same pattern

No `tabIndex` values > 0 needed — natural DOM order is correct.

### What NOT To Do

- Do NOT install any keyboard/focus libraries — native DOM APIs are sufficient
- Do NOT use roving tabindex or focus trapping — each element is independently tabbable
- Do NOT add keyboard shortcuts (Ctrl+N, etc.) — story only requires Tab/Enter/Space/Escape
- Do NOT change TaskInput — it already handles Enter and maintains focus correctly
- Do NOT change the Checkbox component — Chakra handles Space key natively
- Do NOT change the edit mode keyboard handling — Enter/Escape already work
- Do NOT touch backend files — this is a frontend-only change
- Do NOT add `role="button"` to the Text element — story 3.2 handles screen reader semantics

### Previous Story Learnings

- Chakra v3 `css` prop supports `@keyframes`, `@media` (used in stories 2.2, 2.3)
- `prefers-reduced-motion` is already handled — preserve it
- Composite keys `active-{id}` / `completed-{id}` force remount animation — do not change
- `variant="flushed"` with `border="none"` used for invisible edit input
- Story 2.1 review explicitly deferred "No keyboard entry to edit mode" to this story
- Delete button already becomes visible on `:focus-visible` (CSS rule from story 2.3)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR11]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture]
- [Source: _bmad-output/implementation-artifacts/2-1-inline-task-editing.md — Review: deferred keyboard edit mode]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- globalCss `*:focus-visible` in Chakra v3 defineConfig applies to all focusable elements
- `tabIndex={0}` on Text makes it tabbable; inline `onKeyDown` for Enter triggers edit mode
- `data-task-id` attribute on HStack enables DOM querying for focus management
- `handleDeleteWithFocus` uses `requestAnimationFrame` to wait for React re-render before focusing
- Focus fallback to input uses `document.querySelector('[aria-label="Add a new task"]')`
- `listRef` typed as `HTMLDivElement` because Chakra VStack renders a div

### Completion Notes List

- All 9 acceptance criteria satisfied
- Custom focus ring: 2px solid #007AFF with 2px offset on all `:focus-visible` elements
- Task text now tabbable (`tabIndex={0}`) and keyboard-editable (Enter key starts edit)
- Focus management after deletion: next task gets focus, or input if list empties
- Existing keyboard behaviors preserved: Enter in TaskInput, Space on Checkbox, Escape in edit mode
- Resolves deferred item from story 2.1 review: "No keyboard entry to edit mode"
- Lint clean, build clean, backend 27 tests pass (no regressions)
- 3 source files modified — minimal blast radius

### File List

- packages/frontend/src/theme/index.ts (modified — added globalCss focus ring)
- packages/frontend/src/components/TaskItem.tsx (modified — tabbable text with Enter key, data-task-id)
- packages/frontend/src/components/TaskList.tsx (modified — focus management after deletion)

## Change Log

- 2026-04-30: Story implemented — keyboard navigation with custom focus ring, tabbable task text, and focus management after deletion
