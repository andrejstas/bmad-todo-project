# Story 3.3: WCAG AA Compliance Audit & Fixes

Status: done

## Story

As a **user with accessibility needs**,
I want the app to meet WCAG AA standards,
so that I can use it regardless of my abilities.

## Acceptance Criteria

1. **Given** all text elements in the app **When** I measure contrast ratios against their backgrounds **Then** normal text meets 4.5:1 minimum and large text meets 3:1 minimum

2. **Given** the app's HTML structure **When** I inspect landmarks **Then** proper landmark regions exist (`main`) with correct heading hierarchy (`h1` for app title)

3. **Given** all form elements (input field, checkboxes) **When** I inspect their labels **Then** each has an associated label (via `aria-label` or visible label)

4. **Given** the app's HTML structure **When** I inspect semantic elements **Then** the task list uses `ul`/`li`, interactive elements use proper roles, and no `div`-only click handlers exist

5. **Given** the strikethrough styling on completed tasks **When** I assess how completion state is conveyed **Then** it is communicated through both visual change (strikethrough + color) and checkbox state — not color alone

6. **Given** all interactive elements **When** I check their click/touch targets **Then** each has a minimum 44x44px target area

7. **Given** the complete app **When** I test all interactions via keyboard only **Then** every action (add, edit, complete, uncomplete, remove) is achievable without a mouse (NFR18)

## Tasks / Subtasks

- [x] Task 1: Add role="button" to TaskItem Text element (AC: #4)
  - [x] Add `role="button"` to the Text element that triggers inline editing
  - [x] This makes screen readers announce it as an interactive element
  - [x] Resolves story 3.1 review finding: "Text lacks role='button'"
- [x] Task 2: Ensure minimum 44x44px touch targets (AC: #6)
  - [x] Add `minH="44px"` and `minW="44px"` to the Checkbox.Root component
  - [x] Add `minH="44px"` and `minW="44px"` to the delete IconButton
  - [x] Verify the TaskInput already meets 44px minimum (it has `p="16px"` — 16px padding + text height > 44px)
- [x] Task 3: Verify existing compliance (AC: #1, #2, #3, #5, #7)
  - [x] AC #1: Contrast ratios — `#1D1D1F` on `#FFFFFF` is ~15.4:1, `#6E6E73` on `#FFFFFF` is ~4.6:1 — both pass AA
  - [x] AC #2: Landmarks — `Box as="main"` + `Heading as="h1"` — already correct
  - [x] AC #3: Labels — TaskInput has `aria-label`, Checkbox has `aria-label={task.text}` — already correct
  - [x] AC #5: Completion conveyed via strikethrough + color + checkbox state — not color alone — already correct
  - [x] AC #7: All interactions keyboard-accessible — verified in story 3.1 — already correct
- [x] Task 4: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

## Dev Notes

### Existing Code State — What Already Passes

**AC #1 — Contrast ratios:** All color combinations meet WCAG AA:
- `#1D1D1F` on `#FFFFFF` → ~15.4:1 (passes AAA)
- `#6E6E73` on `#FFFFFF` → ~4.6:1 (passes AA)
- `#007AFF` on `#FFFFFF` → ~4.5:1 (passes AA for large text; used as focus ring, not text)
- No changes needed.

**AC #2 — Landmarks:** App.tsx uses `Box as="main"` and `Heading as="h1"`. Correct.

**AC #3 — Form labels:** TaskInput has `aria-label="Add a new task"`, Checkbox.HiddenInput has `aria-label={task.text}`, delete IconButton has `aria-label={...}`. All correct.

**AC #5 — Completion state:** Conveyed via checkbox checked state + strikethrough text + secondary color. Not color-only.

**AC #7 — Keyboard:** All interactions were made keyboard-accessible in story 3.1 (tabIndex, Enter key, focus management).

### Existing Code State — What Needs Fixes

**TaskItem.tsx — Text element missing role (AC #4):**
```tsx
<Text
  flex="1"
  fontSize="16px"
  // ...
  tabIndex={0}
  onClick={startEditing}
  onKeyDown={(e) => { if (e.key === 'Enter') startEditing() }}
>
```
- Has `tabIndex={0}`, `onClick`, `onKeyDown` — behaves as interactive
- Missing `role="button"` — screen readers announce as generic text
- **Fix:** Add `role="button"`

**TaskItem.tsx — Undersized touch targets (AC #6):**
- Checkbox.Root: Chakra default is ~20x20px — below 44px minimum
- Delete IconButton with `size="sm"`: ~32x32px — below 44px minimum
- **Fix:** Add `minH="44px"` and `minW="44px"` (or `display="flex"` + `alignItems="center"` + `justifyContent="center"` if needed to keep visual size small but touch area large)

### Implementation — Task 1: Add role to Text

```tsx
<Text
  role="button"
  tabIndex={0}
  onClick={startEditing}
  onKeyDown={(e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      startEditing()
    }
  }}
  // ... existing props
>
```

Just add `role="button"` — one prop.

### Implementation — Task 2: Touch targets

For the Checkbox, add min dimensions to `Checkbox.Root`:
```tsx
<Checkbox.Root
  checked={task.completed}
  onCheckedChange={() => onToggle(task.id, !task.completed)}
  minH="44px"
  minW="44px"
  display="flex"
  alignItems="center"
>
```

For the delete IconButton, override the min dimensions:
```tsx
<IconButton
  className="delete-btn"
  aria-label={`Delete task: ${task.text}`}
  size="sm"
  variant="ghost"
  color="#FF3B30"
  minH="44px"
  minW="44px"
  onClick={() => onDelete(task.id)}
>
```

**Note:** `minH`/`minW` expands the clickable/tappable area while `size="sm"` keeps the visual icon small. This is a common pattern for meeting touch target requirements.

**IMPORTANT:** Test that Checkbox.Root in Chakra v3 accepts `minH`/`minW` props. If not, wrap in a Box with those dimensions. Check the rendered output to ensure the touch target actually expands.

### What NOT To Do

- Do NOT change color values — all contrasts already pass AA
- Do NOT change heading hierarchy — already correct
- Do NOT change aria-labels — already correct
- Do NOT add skip navigation links — not required for a single-view app with < 10 interactive elements
- Do NOT add `aria-describedby` or `aria-details` — not required by the ACs
- Do NOT touch backend files — frontend-only changes
- Do NOT change the VStack/ul semantics in TaskList — already correct with `role="list"` and `aria-live`

### Previous Story Learnings

- Story 3.1 added `tabIndex={0}` and `onKeyDown` to Text — keyboard accessibility
- Story 3.1 review explicitly noted "Text lacks role='button'" — deferred to this story
- Story 3.2 added `aria-live="polite"` and `aria-relevant="additions removals"` to TaskList
- Story 3.1 added `globalCss` with `*:focus-visible` focus ring — 2px solid #007AFF
- Chakra v3 `css` prop supports `@keyframes`, `@media` (used in stories 2.2, 2.3)
- `data-task-id` attribute on TaskItem HStack — used for focus management

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Accessibility Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture]
- [Source: _bmad-output/implementation-artifacts/3-1-keyboard-navigation-focus-management.md — Review Findings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Added `role="button"` to Text element — screen readers now announce it as interactive
- Checkbox.Root: added `minH="44px"` `minW="44px"` `display="flex"` `alignItems="center"` for touch target
- IconButton delete: added `minH="44px"` `minW="44px"` — expands touch area while `size="sm"` keeps icon small
- TaskInput already > 44px due to `p="16px"` + text height — no change needed

### Completion Notes List

- All 7 acceptance criteria satisfied
- AC #1: Contrast ratios verified — all pass AA (15.4:1 and 4.6:1)
- AC #2: Landmarks correct — `main` + `h1`
- AC #3: Labels correct — all form elements have aria-labels
- AC #4: `role="button"` added to interactive Text element
- AC #5: Completion state conveyed via checkbox + strikethrough + color
- AC #6: Touch targets expanded to 44x44px minimum on checkbox and delete button
- AC #7: All interactions keyboard-accessible (verified in story 3.1)
- Resolves story 3.1 review finding: "Text lacks role='button'"
- Lint clean, build clean, backend 27 tests pass (no regressions)
- 1 source file modified

### File List

- packages/frontend/src/components/TaskItem.tsx (modified — role="button", 44px touch targets)

## Change Log

- 2026-04-30: Story implemented — role="button" on Text, 44x44px minimum touch targets on checkbox and delete button
