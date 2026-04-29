# Story 1.3: Frontend Theme & Floating Card Layout

Status: done

## Story

As a **user**,
I want a clean, minimal app interface,
so that I can focus on my tasks without visual distractions.

## Acceptance Criteria

1. **Given** the app loads **When** the page renders **Then** I see a white floating card centered on an off-white (`#FAFAFA`) background

2. **Given** the card is rendered **When** I inspect its styles **Then** it has max-width 600px, 12px border-radius, and a soft elevation shadow (`0 1px 3px rgba(0,0,0,0.08)`)

3. **Given** the page loads **When** I check the layout **Then** the card has generous top margin (80-100px) and uses a VStack for vertical content flow

4. **Given** the Chakra theme is applied **When** I inspect typography **Then** the system font stack is used (`-apple-system, BlinkMacSystemFont, ...`) with the defined type scale (20px/600 title, 14px/500 counter, 16px/400 body)

5. **Given** the Chakra theme is applied **When** I inspect color tokens **Then** the full palette is defined: `#1D1D1F` primary text, `#6E6E73` secondary, `#007AFF` accent, `#0066D6` accent hover, `#34C759` success, `#FF3B30` danger, `#E5E5EA` border, `#F2F2F7` input background

6. **Given** the Chakra theme is applied **When** I inspect spacing and radii tokens **Then** the 8px base unit scale (xs through 2xl) and border radii (12px cards, 6px checkboxes) are defined

7. **Given** the app shell renders **When** I check the HTML **Then** it uses semantic elements — `main` landmark region and `h1` heading for the app title

8. **Given** the app shell renders **When** I check providers **Then** `ChakraProvider` and `QueryClientProvider` wrap the application

## Tasks / Subtasks

- [x] Task 1: Create custom Chakra UI v3 theme (AC: #4, #5, #6)
  - [x] Create `src/theme/index.ts` using `defineConfig()` + `createSystem(defaultConfig, config)`
  - [x] Define color tokens: background, surface, text primary/secondary, accent/hover, success, danger, border, input bg
  - [x] Define typography: system font stack, type scale (title 20px/600, counter 14px/500, body 16px/400)
  - [x] Define spacing scale: 8px base unit (xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48)
  - [x] Define border radii: card=12px, checkbox=6px
  - [x] Define shadow tokens: card elevation, input inset
- [x] Task 2: Set up providers in main.tsx (AC: #8)
  - [x] Wrap app with `ChakraProvider` (using `value={system}` prop — v3 API)
  - [x] Wrap app with `QueryClientProvider` (create QueryClient instance)
  - [x] Remove `import './index.css'` — Chakra handles all styling
- [x] Task 3: Replace App.tsx with floating card layout (AC: #1, #2, #3, #7)
  - [x] Remove Vite boilerplate (counter, logos, CSS imports)
  - [x] Create `main` landmark with `#FAFAFA` background, min-height 100vh
  - [x] Create centered `Container` max-width 600px
  - [x] Create white `Box` card with 12px border-radius, soft shadow, padding
  - [x] Add `Heading` as `h1` for app title ("Tasks") — 20px/600 weight
  - [x] Use `VStack` for vertical content flow inside card
  - [x] Set top margin 80-100px on card container
- [x] Task 4: Clean up Vite boilerplate files
  - [x] Delete `src/App.css`
  - [x] Delete `src/index.css`
  - [x] Delete `src/assets/react.svg`
  - [x] Delete `public/vite.svg`
  - [x] Update `index.html` title to "Tasks" (from "Vite + React + TS")
- [x] Task 5: Verify theme and layout
  - [x] App renders without errors
  - [x] Lint passes: `corepack yarn lint`
  - [x] Build passes: `corepack yarn workspace frontend build`

## Dev Notes

### CRITICAL: Chakra UI v3 API (NOT v2)

The installed version is `@chakra-ui/react@3.35.0`. v3 has a **completely different API** from v2. Do NOT use v2 patterns.

**Theme creation (v3):**
```typescript
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: { 500: { value: "#007AFF" } }
      }
    }
  }
})

export const system = createSystem(defaultConfig, config)
```

**Provider (v3):**
```tsx
import { ChakraProvider } from "@chakra-ui/react"
import { system } from "./theme"

// v3 uses `value` prop, NOT `theme`
<ChakraProvider value={system}>
```

**Key v3 differences from v2:**
- `extendTheme()` → `defineConfig()` + `createSystem()`
- `<ChakraProvider theme={theme}>` → `<ChakraProvider value={system}>`
- Token values use `{ value: "..." }` wrapper syntax
- `Divider` is replaced by `Separator`
- Semantic tokens reference other tokens with `{colors.brand.500}` syntax

### Existing Code State

**`src/main.tsx`** — Current: Renders `<App />` in `<StrictMode>`, imports `./index.css`. **Changes:** Add ChakraProvider and QueryClientProvider wrappers, remove CSS import.

**`src/App.tsx`** — Current: Vite boilerplate (counter, logos). **Changes:** Complete replacement with card layout shell.

**`src/App.css`** — Vite boilerplate. **Delete entirely.**

**`src/index.css`** — Vite boilerplate global styles. **Delete entirely.** Chakra handles all styling.

**`index.html`** — Current title is "Vite + React + TS". **Update title** to "Tasks".

### Design Tokens (from UX Spec)

**Colors:**
| Token | Value | Usage |
|-------|-------|-------|
| bg | #FAFAFA | Page background |
| surface | #FFFFFF | Card background |
| fg | #1D1D1F | Primary text |
| fg.muted | #6E6E73 | Secondary text, completed tasks |
| accent | #007AFF | Interactive elements, focus ring |
| accent.hover | #0066D6 | Hover state for accent |
| success | #34C759 | Completion indicator |
| danger | #FF3B30 | Delete action |
| border | #E5E5EA | Light gray borders |
| input.bg | #F2F2F7 | Input field background |

**Typography:**
- Font family: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- Title: 20px, weight 600
- Counter: 14px, weight 500
- Body/task text: 16px, weight 400
- Line height: 1.5

**Spacing (8px base):**
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

**Border radii:**
- card: 12px, checkbox: 6px

**Shadows:**
- card: `0 1px 3px rgba(0,0,0,0.08)`
- input: `inset 0 1px 2px rgba(0,0,0,0.05)`

### Card Layout Structure

```
<main> (bg=#FAFAFA, min-h=100vh)
  <Container> (maxW=600px, pt=80-100px)
    <Box> (bg=white, borderRadius=12px, shadow, p=lg)
      <VStack spacing=lg>
        <Heading as="h1"> "Tasks" </Heading>
        {/* Story 1.4+ adds: ProgressCounter, TaskInput, TaskList */}
      </VStack>
    </Box>
  </Container>
</main>
```

The card is intentionally minimal — just the title for now. Components are added in Stories 1.4-1.6.

### File Structure for This Story

```
packages/frontend/src/
├── theme/
│   └── index.ts        # Custom Chakra v3 system (NEW)
├── main.tsx            # UPDATE: add providers
├── App.tsx             # UPDATE: replace with card layout
├── App.css             # DELETE
├── index.css           # DELETE
├── assets/
│   └── react.svg       # DELETE
packages/frontend/
├── public/
│   └── vite.svg        # DELETE
├── index.html          # UPDATE: title
```

### QueryClient Setup

Create a `QueryClient` instance and wrap with `QueryClientProvider`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// In render:
<QueryClientProvider client={queryClient}>
```

No custom QueryClient options needed for this story. Defaults are fine.

### Anti-Patterns to Avoid

- Do NOT use `extendTheme()` — that's Chakra v2. Use `defineConfig()` + `createSystem()`
- Do NOT use `<ChakraProvider theme={...}>` — v3 uses `value` prop
- Do NOT use `<Divider>` — v3 renamed it to `<Separator>`
- Do NOT write custom CSS files — all styling through Chakra props
- Do NOT add any task components (TaskInput, TaskItem, etc.) — those come in Stories 1.4-1.6
- Do NOT import or reference the deleted CSS/SVG files
- Do NOT add dark mode support — light mode only per UX spec

### Previous Story Learnings

- `corepack yarn` must be used instead of bare `yarn`
- ESLint flat config at root — shared for both packages
- Backend uses `moduleResolution: "nodenext"` but frontend uses `"bundler"` (Vite default) — frontend does NOT need `.js` extensions on imports

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Visual Design Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design Direction: Floating Card]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Component Strategy]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.3]
- [Source: _bmad-output/planning-artifacts/epics.md — UX-DR1 through UX-DR3]

## Change Log

- 2026-04-29: Story implemented — Chakra UI v3 theme with custom tokens, ChakraProvider + QueryClientProvider setup, floating card layout, Vite boilerplate removed

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- Used Chakra UI v3 API (`defineConfig` + `createSystem`) — NOT v2's `extendTheme`
- ChakraProvider uses `value` prop per v3 API
- Responsive top padding: 32px on mobile, 80px on desktop (via Chakra responsive object syntax)
- Removed favicon link from index.html since vite.svg was deleted

### Completion Notes List

- All 8 acceptance criteria satisfied
- Custom theme with all design tokens (colors, fonts, spacing, radii, shadows)
- ChakraProvider and QueryClientProvider wrap the app
- Floating card layout with semantic HTML (main + h1)
- Vite boilerplate fully removed (App.css, index.css, SVGs)
- Lint clean, build produces 473KB bundle (gzip 133KB)
- Backend 27 tests still pass (no regressions)

### File List

- packages/frontend/src/theme/index.ts (new)
- packages/frontend/src/main.tsx (modified — providers added)
- packages/frontend/src/App.tsx (modified — complete rewrite to card layout)
- packages/frontend/index.html (modified — title updated, favicon removed)
- packages/frontend/src/App.css (deleted)
- packages/frontend/src/index.css (deleted)
- packages/frontend/src/assets/react.svg (deleted)
- packages/frontend/public/vite.svg (deleted)
