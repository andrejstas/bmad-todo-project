# Story 2.2: Task Section Transition Animations

Status: done

## Story

As a **user**,
I want smooth visual transitions when tasks move between sections,
so that I can track where tasks went after completing or uncompleting them.

## Acceptance Criteria

1. **Given** an active task exists **When** I mark it as complete **Then** the task animates smoothly to the completed section over ~200ms

2. **Given** a completed task exists **When** I toggle it back to active **Then** the task animates smoothly to the active section over ~200ms

3. **Given** my OS has `prefers-reduced-motion: reduce` enabled **When** tasks move between sections **Then** animations are disabled and transitions are instant

4. **Given** a task is being added to the list **When** it appears **Then** it enters with a subtle transition (not a hard pop-in)

## Tasks / Subtasks

- [x] Task 1: Add CSS enter animation to TaskItem (AC: #1, #2, #4)
  - [x] Add `@keyframes fadeSlideIn` animation to TaskItem via Chakra's `css` prop or `animation` style
  - [x] Animation: fade in from opacity 0 + slight translateY, ~200ms duration, ease-out
  - [x] Animation plays on mount — covers both new tasks (AC #4) and section transitions (AC #1, #2)
- [x] Task 2: Respect prefers-reduced-motion (AC: #3)
  - [x] Add `@media (prefers-reduced-motion: reduce)` that sets animation to `none`
  - [x] Can be done via CSS media query in the component's `css` prop
- [x] Task 3: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

### Review Findings

- [x] [Review][Patch] React key recycling prevents remount animation — FIXED: composite keys `active-{id}` / `completed-{id}` force remount on toggle [TaskList.tsx]
- [x] [Review][Patch] Delete button transition not covered by prefers-reduced-motion — FIXED: added `transition: 'none'` in reduced-motion media query [TaskItem.tsx]

## Dev Notes

### Existing Code State

**`src/components/TaskItem.tsx`** — Current: HStack with checkbox, editable text, delete button. Already has a `css` prop for progressive disclosure. **Changes:** Add animation styles to the existing `css` prop.

### Animation Approach

When a task toggles completion, React unmounts it from one section (active/completed) and remounts it in the other. A CSS `@keyframes` animation on mount creates the visual transition without needing a layout animation library.

**Implementation — add to TaskItem's `css` prop:**
```typescript
css={{
  animation: 'fadeSlideIn 0.2s ease-out',
  '@keyframes fadeSlideIn': {
    from: { opacity: 0, transform: 'translateY(-8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
  // existing progressive disclosure styles...
  '& .delete-btn': { opacity: 0, transition: 'opacity 0.15s' },
  '&:hover .delete-btn, &:focus-within .delete-btn, & .delete-btn:focus-visible': { opacity: 1 },
}}
```

This is a pure CSS approach — no React state, no animation library, no new dependencies.

### Why This Works

- **Task completion toggle:** React's `key={task.id}` on TaskItem means when a task moves between the active and completed lists, React unmounts the old instance and mounts a new one. The `@keyframes` animation fires on mount, creating a smooth fade-in effect.
- **New task added:** Same animation fires when a new TaskItem mounts.
- **Reduced motion:** The `@media` query disables the animation entirely, making transitions instant.

### What NOT To Do

- Do NOT install framer-motion, react-spring, or any animation library — pure CSS only
- Do NOT try to animate the "movement" from one position to another — that requires layout animations which are beyond scope
- Do NOT add transitions to the Separator — it should appear/disappear instantly
- Do NOT modify any other files besides TaskItem.tsx
- Do NOT use JavaScript-based animation timing — CSS handles this

### Previous Story Learnings

- TaskItem already has a `css` prop for the delete button progressive disclosure — merge animation styles into the same object
- Chakra v3 supports `css` prop for raw CSS including `@keyframes` and `@media`
- `variant="flushed"` with `border="none"` used for invisible edit input

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR8]

## Change Log

- 2026-04-29: Story implemented — CSS fadeSlideIn animation on TaskItem mount with prefers-reduced-motion support

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Merged animation CSS into existing `css` prop alongside progressive disclosure styles
- Used `@keyframes` + `@media` within Chakra's `css` prop — no separate CSS file needed

### Completion Notes List

- All 4 acceptance criteria satisfied
- fadeSlideIn: opacity 0→1 + translateY -8px→0, 200ms ease-out
- prefers-reduced-motion: reduce disables animation entirely
- Single file change — minimal blast radius
- Lint clean, build clean, backend 27 tests pass

### File List

- packages/frontend/src/components/TaskItem.tsx (modified — added animation CSS)
