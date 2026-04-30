# Story 2.3: Responsive Layout & Touch Adaptation

Status: done

## Story

As a **user on a tablet or phone**,
I want the app to adapt to my screen size,
so that I can manage tasks comfortably on any device.

## Acceptance Criteria

1. **Given** a viewport width below 768px **When** the app renders **Then** the card goes full-width with 16px horizontal padding (no floating effect)

2. **Given** a viewport width below 768px **When** the layout renders **Then** the top margin is reduced to 32px to maximize content area

3. **Given** a viewport width below 768px **When** I view the task list **Then** delete icons are always visible (no hover-reveal on touch devices)

4. **Given** a viewport width of 768px or above **When** the app renders **Then** the floating card layout is shown, centered with max-width 600px and hover-reveal delete icons

5. **Given** the responsive breakpoints **When** I inspect the implementation **Then** Chakra UI responsive object props are used for layout changes (e.g., `{{ base: 'x', md: 'y' }}`)

## Tasks / Subtasks

- [x] Task 1: Make card layout responsive in App.tsx (AC: #1, #2, #4)
  - [x] Change Container `maxW` to `{{ base: "100%", md: "600px" }}`
  - [x] Remove Container default horizontal padding on mobile so card fills viewport
  - [x] Change Card Box `borderRadius` to `{{ base: "0", md: "12px" }}`
  - [x] Change Card Box `boxShadow` to `{{ base: "none", md: "0 1px 3px rgba(0,0,0,0.08)" }}`
  - [x] Change Card Box padding: `px={{ base: "16px", md: "24px" }}`, keep `py="24px"`
  - [x] Verify `pt={{ base: '32px', md: '80px' }}` already handles AC #2 (it does)
- [x] Task 2: Make delete button always visible on mobile in TaskItem.tsx (AC: #3, #4)
  - [x] Restructure the `css` prop so `.delete-btn` defaults to `opacity: 1` (mobile-first)
  - [x] Wrap progressive disclosure rules in `@media (min-width: 48em)` inside the `css` prop
  - [x] Keep existing `prefers-reduced-motion` and animation rules intact
- [x] Task 3: Verify functionality
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`
  - [x] Backend tests still pass (no regressions)

### Review Findings

- [x] [Review][Defer] Hardcoded `48em` in TaskItem.tsx css prop won't track if Chakra `md` breakpoint is customized — deferred, no clean fix without useBreakpointValue (which spec prohibits)

## Dev Notes

### Existing Code State

**`src/App.tsx`** — Current layout:
```tsx
<Box as="main" bg="#FAFAFA" minH="100vh">
  <Container maxW="600px" pt={{ base: '32px', md: '80px' }}>
    <Box bg="white" borderRadius="12px" boxShadow="0 1px 3px rgba(0,0,0,0.08)" p="24px">
      <VStack gap="24px" align="stretch">
        ...
      </VStack>
    </Box>
  </Container>
</Box>
```
- `pt` is already responsive (AC #2 is already satisfied) — do NOT change it
- `maxW`, `borderRadius`, `boxShadow`, `p` are static — make them responsive

**`src/components/TaskItem.tsx`** — Current progressive disclosure in `css` prop:
```tsx
css={{
  animation: 'fadeSlideIn 0.2s ease-out',
  '@keyframes fadeSlideIn': {
    from: { opacity: 0, transform: 'translateY(-8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    '& .delete-btn': { transition: 'none' },
  },
  '& .delete-btn': { opacity: 0, transition: 'opacity 0.15s' },
  '&:hover .delete-btn, &:focus-within .delete-btn, & .delete-btn:focus-visible': { opacity: 1 },
}}
```
- Delete button is hidden by default (`opacity: 0`) and revealed on hover/focus
- This needs to be inverted for mobile-first: visible by default, hidden only on desktop

### Implementation — App.tsx

Replace the current static layout props with Chakra responsive object syntax:

```tsx
<Container maxW={{ base: "100%", md: "600px" }} px={{ base: "0", md: undefined }} pt={{ base: '32px', md: '80px' }}>
  <Box
    bg="white"
    borderRadius={{ base: "0", md: "12px" }}
    boxShadow={{ base: "none", md: "0 1px 3px rgba(0,0,0,0.08)" }}
    px={{ base: "16px", md: "24px" }}
    py="24px"
  >
```

**Key details:**
- Container `px={{ base: "0", md: undefined }}` removes horizontal padding on mobile so the card fills the full viewport width. If `undefined` doesn't reset to Chakra default, use an explicit desktop value instead.
- Card `p="24px"` is split into `px` and `py` to allow different horizontal padding per breakpoint.
- The `pt` on Container is already responsive — leave it unchanged.

### Implementation — TaskItem.tsx

Restructure the `css` prop to mobile-first: delete button visible by default, progressive disclosure only on desktop (>= 48em = 768px):

```tsx
css={{
  animation: 'fadeSlideIn 0.2s ease-out',
  '@keyframes fadeSlideIn': {
    from: { opacity: 0, transform: 'translateY(-8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    '& .delete-btn': { transition: 'none' },
  },
  '& .delete-btn': { transition: 'opacity 0.15s' },
  '@media (min-width: 48em)': {
    '& .delete-btn': { opacity: 0 },
    '&:hover .delete-btn, &:focus-within .delete-btn, & .delete-btn:focus-visible': { opacity: 1 },
  },
}}
```

**What changed:**
- Removed `opacity: 0` from default `.delete-btn` rule — button is visible by default (mobile)
- Moved `opacity: 0` and hover/focus reveal rules inside `@media (min-width: 48em)` — desktop only
- `48em` matches Chakra's `md` breakpoint (768px at 16px base font)

**Why `@media` in the `css` prop is necessary here:** Chakra responsive object syntax (`{{ base, md }}`) works on style props but NOT on CSS pseudo-class selectors like `&:hover`. The `css` prop is a CSS-in-JS escape hatch — using `@media` within it is the correct and only approach for responsive pseudo-class behavior.

### What NOT To Do

- Do NOT install any responsive/breakpoint libraries — Chakra handles everything
- Do NOT use `useBreakpointValue` hook — prefer CSS-based responsive for this (no JS needed)
- Do NOT add Chakra's `display={{ base: "flex", md: "none" }}` show/hide patterns — both layouts use the same components, just different styles
- Do NOT change the VStack, Heading, ProgressCounter, TaskInput, or TaskList components — only App.tsx layout wrapper and TaskItem.tsx delete button behavior change
- Do NOT modify `pt={{ base: '32px', md: '80px' }}` — it already satisfies AC #2
- Do NOT touch backend files — this is a frontend-only change

### Previous Story Learnings

- Chakra v3 `css` prop supports `@keyframes` and `@media` (used in story 2.2)
- `prefers-reduced-motion` is already handled in the `css` prop — preserve it
- Composite keys `active-{id}` / `completed-{id}` in TaskList force remount animation — do not change
- `variant="flushed"` with `border="none"` used for invisible edit input — not touched in this story
- Story 2.2 review found that `prefers-reduced-motion` needed to also cover the delete button transition — already fixed

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR9, UX-DR10]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Responsive Strategy, Breakpoint Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Container `px={{ base: '0', md: '4' }}` removes Chakra default padding on mobile; `'4'` is Chakra spacing token on desktop
- Card `p="24px"` split into `px`/`py` to allow responsive horizontal padding
- Delete button mobile-first: removed `opacity: 0` from default `.delete-btn`, moved progressive disclosure into `@media (min-width: 48em)`
- `pt={{ base: '32px', md: '80px' }}` was already responsive from prior stories — no change needed

### Completion Notes List

- All 5 acceptance criteria satisfied
- < 768px: card full-width, no border-radius, no shadow, 16px horizontal padding, delete icons always visible
- >= 768px: floating card centered at max-width 600px, 12px radius, shadow, hover-reveal delete icons
- Chakra responsive object props used throughout (`{ base, md }`)
- `@media (min-width: 48em)` used in `css` prop for responsive pseudo-class behavior (hover/focus)
- Existing animations and prefers-reduced-motion rules preserved
- Lint clean, build clean, backend 27 tests pass (no regressions)
- Only 2 source files modified — minimal blast radius

### File List

- packages/frontend/src/App.tsx (modified — responsive layout props)
- packages/frontend/src/components/TaskItem.tsx (modified — mobile-first delete button visibility)

## Change Log

- 2026-04-29: Story implemented — responsive layout with Chakra object props, mobile-first delete button visibility via @media in css prop
