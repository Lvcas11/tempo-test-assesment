# CLAUDE.md — Sticky Notes

Project directives for working in this repository. Follow these exactly.

## What this is

A single-page sticky-notes app, built as a take-home assessment. The brief grades **architecture,
performance, code quality, static-typing accuracy, and usability**, and explicitly requires
**"React without stock components / avoid ready-made solutions"** so reviewers can assess how the
drag/resize interactions are engineered.

## Hard rules (non-negotiable)

1. **No ready-made interaction/UI libraries.** All drag, resize, rubber-band create, and pen
   drawing are hand-written with Pointer Events. Runtime `dependencies` are limited to
   `react` / `react-dom`. Everything else is `devDependencies` (build/test tooling only).
2. **Each feature ships with its tests.** A feature is not done until it has a passing Playwright
   e2e spec in `e2e/` plus meaningful unit/component coverage.
3. **Comments are sparse.** English only, and only where they materially aid reading (per the brief).

## MANDATORY quality gate — run before EVERY commit

**Do not commit until ALL SIX pass with zero errors and zero warnings.** This is blocking; no
exceptions, not even for "trivial" or docs-only changes. Run them as the last step before committing:

```bash
npm run format:check   # 1. Prettier
npm run lint           # 2. ESLint — zero errors AND zero warnings
npm run typecheck      # 3. tsc --noEmit (strict)
npm run test           # 4. Vitest unit/component
npm run build          # 5. production build
npm run test:e2e       # 6. Playwright e2e (Chromium + Firefox)
```

If any check fails, fix it and re-run **all six** before committing. The same gate runs in CI
(`.github/workflows/ci.yml`) on every push and pull request, so a red commit will fail CI anyway —
catch it locally first. Never mark work "done" without this gate green.

## Tech stack

Vite 8 · React 19 · TypeScript (strict) · Tailwind v4 (CSS-first `@theme` tokens) ·
Vitest + React Testing Library · Playwright.

## Architecture

Flat structure under `src/` (single-domain app — no `features/` nesting):

- `src/components/` — one folder per component: `Component/Component.tsx` + `Component.test.tsx`
  + `index.ts` barrel. Components: `Note`, `Canvas`, `ColorPicker`, `ClearAllButton`,
  `ResizeHandles`, `DrawingLayer`, `RubberBand`.
- `src/hooks/` — `usePointerDrag` (the reusable gesture engine) + `useRafThrottle`,
  `useNoteGestures`, `useCreateNote`, `useDrawing`, `useAutoGrow`, `useNotesPersistence`.
- `src/state/` — `notesReducer`, `actions`, split `NotesStateContext` / `NotesDispatchContext`
  (`context.ts`), `NotesProvider`, selector hooks (`useNotes`), `createNoteId`, `index` barrel.
- `src/api/` — async mock REST client (localStorage-backed, simulated latency).
- `src/lib/` — pure `geometry` helpers (clamp / resize / intersect).
- `src/types.ts` — domain types. `src/constants.ts` — sizes, thresholds, and the note color
  token maps (`NOTE_COLOR_BG` / `NOTE_COLOR_BAR` / `NOTE_COLOR_LABEL`).
- `src/test/` — Vitest setup + shared render helper (`renderWithNotes`) and `fixtures`.

Deletion UX: a per-note `×` button removes one note; a navbar **Clear all** (with inline confirm)
wipes the board. There is no drag-to-trash zone.

## Performance strategy

During an active gesture, write `transform` / size **directly to the DOM node via ref** (bypassing
React), rAF-throttled. Commit geometry to state (`dispatch`) only on `pointerup`. Each `Note` is
`React.memo`'d and reads only its own slice. Split contexts keep dispatch-only consumers from
re-rendering on state changes.

## TypeScript standards (expert-level)

- Branded `NoteId` (`string & { readonly __brand: 'NoteId' }`).
- `Action` as a discriminated union; reducer exhaustive with a `never` assertion in `default`.
- Resize handles derived from a **tuple** of edge/corner literals, not a hand-written union.
- Generic `Rect`/`Geometry` model; conditional/utility types for clamping and resize-anchor math.
- `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` are on — respect them.

## Conventions

- Import alias: **`@/` → `src/`. Use it for all cross-folder imports** (avoid `../` chains).
- **Components live in their own folder** (`Name/Name.tsx` + `Name.test.tsx` + `index.ts` barrel);
  import via the barrel, e.g. `import { Note } from '@/components/Note'`.
- Colocate unit tests next to the code they cover; behavior tests, no snapshots.
- Prettier: no semicolons, single quotes, trailing commas, width 100.
- Prefer small, focused files with one clear responsibility.

## Scripts

`dev` · `build` · `preview` · `typecheck` · `lint` · `format` · `format:check` ·
`test` (unit) · `test:e2e` · `test:coverage`.
