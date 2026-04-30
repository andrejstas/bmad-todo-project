# Story 3.2: Screen Reader Support & ARIA Live Regions

Status: done

## Story

As a **screen reader user**,
I want task changes announced to me automatically,
so that I can track what's happening without seeing the screen.

## Acceptance Criteria

1. **Given** the progress counter is rendered **When** a task is added, completed, uncompleted, or removed **Then** the updated count is announced via `aria-live="polite"` (e.g., "2 of 5 done")

2. **Given** the task list region **When** a new task is added **Then** the addition is announced to the screen reader

3. **Given** the task list region **When** a task is removed **Then** the removal is announced to the screen reader

4. **Given** a task's checkbox **When** its state changes (checked/unchecked) **Then** the screen reader announces the state change

5. **Given** the task list container **When** I inspect its ARIA attributes **Then** it has `aria-live="polite"` on the list region

6. **Given** all ARIA live region announcements **When** they fire **Then** they use `polite` (not `assertive`) to avoid interrupting the user's current action

## Tasks / Subtasks

- [x] Task 1: Add aria-live to TaskList region (AC: #2, #3, #5, #6)
  - [x] Add `aria-live="polite"` to the VStack `<ul>` element in TaskList.tsx
  - [x] Add `aria-relevant="additions removals"` to control what gets announced (skip text-only changes)
- [x] Task 2: Verify ProgressCounter already satisfies AC #1
  - [x] Confirm ProgressCounter already has `aria-live="polite"` (it does)
  - [x] Confirm it re-renders with updated count when tasks change (it does — receives tasks prop)
- [x] Task 3: Verify checkbox announcements already satisfy AC #4
  - [x] Confirm Checkbox.HiddenInput is a native `<input type="checkbox">` with `aria-label={task.text}`
  - [x] Native checkbox announces "checked"/"unchecked" state changes automatically
- [x] Task 4: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

## Dev Notes

### Existing Code State — What Already Works

**ProgressCounter (AC #1)** — Already has `aria-live="polite"`:
```tsx
<Text fontSize="14px" fontWeight="500" color="#6E6E73" aria-live="polite">
  {completed} of {total} done
</Text>
```
When tasks change, App re-renders → ProgressCounter re-renders with new counts → screen reader announces the new text. No changes needed.

**Checkbox (AC #4)** — Already uses native checkbox with aria-label:
```tsx
<Checkbox.HiddenInput aria-label={task.text} />
```
Chakra's `Checkbox.HiddenInput` renders a native `<input type="checkbox">`. Screen readers natively announce "checked" / "unchecked" state changes. The `aria-label` provides the task text as the checkbox name. No changes needed.

### Existing Code State — What Needs Changes

**TaskList.tsx** — Missing `aria-live` on the list container:
```tsx
<VStack ref={listRef} as="ul" role="list" gap="0" align="stretch" p="0" m="0" listStyleType="none">
```
- Has `role="list"` but no `aria-live`
- **Fix:** Add `aria-live="polite"` and `aria-relevant="additions removals"`

### Implementation — TaskList.tsx

Add two props to the VStack:

```tsx
<VStack
  ref={listRef}
  as="ul"
  role="list"
  aria-live="polite"
  aria-relevant="additions removals"
  gap="0"
  align="stretch"
  p="0"
  m="0"
  listStyleType="none"
>
```

**Why `aria-relevant="additions removals"`:**
- Default `aria-relevant` is `"additions text"` which would announce text changes within the region
- Setting `"additions removals"` limits announcements to when `<li>` elements are added or removed
- This prevents noisy re-announcements when task text changes (inline editing) or when tasks reorder (completion toggle)

### What NOT To Do

- Do NOT add a separate visually-hidden announcement div — the spec explicitly says `aria-live` on the list region itself
- Do NOT use `aria-live="assertive"` — AC #6 requires `polite` for all announcements
- Do NOT change ProgressCounter — it already has `aria-live="polite"` and works correctly
- Do NOT change Checkbox — native checkbox state changes are announced automatically
- Do NOT add `role="button"` or other semantic roles to TaskItem Text — that's story 3.3 scope
- Do NOT touch backend files — this is a frontend-only change
- Do NOT add `aria-atomic="true"` to the list — it would cause the entire list to be re-announced on every change

### Previous Story Learnings

- Story 3.1 added `tabIndex={0}` and `onKeyDown` to Text element — keyboard accessibility
- Story 3.1 added `data-task-id` attribute to TaskItem HStack — used for focus management
- Story 3.1 added `listRef` to TaskList — already has a ref on the VStack
- Story 3.1 review noted Text lacks `role="button"` — explicitly deferred to later story (3.3)
- `globalCss` with `*:focus-visible` added in story 3.1 for custom focus ring
- Composite keys `active-{id}` / `completed-{id}` force remount on completion toggle

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR12]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Added `aria-live="polite"` and `aria-relevant="additions removals"` to VStack in TaskList
- `aria-relevant="additions removals"` prevents noisy re-announcements on text edits or reorder
- ProgressCounter `aria-live="polite"` already in place from story 1.4 — announces count changes
- Checkbox.HiddenInput native `<input type="checkbox">` announces checked/unchecked automatically

### Completion Notes List

- All 6 acceptance criteria satisfied
- AC #1: ProgressCounter already has `aria-live="polite"` — no change needed
- AC #2, #3: TaskList now has `aria-live="polite"` with `aria-relevant="additions removals"`
- AC #4: Native checkbox state changes announced automatically via Checkbox.HiddenInput
- AC #5: `aria-live="polite"` added to task list `<ul>` container
- AC #6: All live regions use `polite` — verified
- Lint clean, build clean, backend 27 tests pass (no regressions)
- 1 source file modified — minimal change

### File List

- packages/frontend/src/components/TaskList.tsx (modified — added aria-live and aria-relevant)

## Change Log

- 2026-04-30: Story implemented — aria-live="polite" with aria-relevant="additions removals" on TaskList region
