# Sticky Notes

A single-page sticky-notes application. Create notes on a canvas, move and resize them by
dragging, edit their text, draw freehand ink on them, recolor and stack them, and delete them —
with a per-note × button, a "Clear all" action, or by dragging a note onto a right-edge delete
zone. Notes persist across reloads through an asynchronous, `localStorage`-backed mock API.

Built for a front-end assessment whose explicit constraint is **"React without stock
components / avoid ready-made solutions"** — so every interaction (drag, resize, rubber-band
create, freehand drawing, delete-zone hit-testing) is hand-written with the Pointer Events API.
The only runtime dependencies are `react` and `react-dom`.

## Features

**Core** — create a note of a specified size at a specified position (rubber-band drag, or click
for a default note), move by dragging, resize by dragging (8 edge/corner grab zones), and delete
notes (× button, "Clear all", or drag onto the right-edge delete zone).

**Bonus & extras** — inline text editing with auto-grow + scroll, freehand drawing (pen mode),
bring-to-front on interaction (z-order), six note colors, keyboard control (move/resize/delete),
and asynchronous persistence to `localStorage` (restored on load).

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

### Other scripts

```bash
npm run build         # type-check + production build
npm run preview       # preview the production build
npm run typecheck     # tsc --noEmit (strict)
npm run lint          # ESLint (type-aware, zero warnings)
npm run format:check  # Prettier
npm run test          # Vitest unit/component tests
npm run test:e2e      # Playwright end-to-end tests (Chromium + Firefox)
```

Playwright browsers are needed once for e2e: `npx playwright install`.

## Usage

- **Create** — drag on empty canvas to rubber-band a note at that position and size, or click to
  drop a default-size note. A new note opens focused, ready to type.
- **Move** — drag a note's accent bar (top). **Resize** — drag any edge or corner (invisible grab
  zones; the cursor changes on hover).
- **Edit** — double-click a note; commit with `⌘/Ctrl + Enter`, cancel with `Esc`. The note grows
  to fit text, and scrolls once you've manually resized it.
- **Draw** — toggle the pen in the note toolbar and draw freehand ink; strokes rescale when the
  note is resized.
- **Recolor** — open the color popover from the note's accent bar.
- **Delete** — click the × button, drag the note onto the **right-edge delete zone**, or use
  **Clear all** in the navbar (with confirm).
- **Keyboard** — focus a note's accent bar, then arrow keys move it, `Alt`+arrows resize, and
  `Delete` removes it.

## Browser support

Desktop, minimum resolution 1024×768. Latest Chrome, Firefox, and Edge. The e2e suite runs on
Chromium (covering Chrome/Edge) and Firefox.

## Architecture

The source is organized as a **flat, single-domain** tree under `src/`: `components/` (each in its
own folder with a colocated test and barrel), `hooks/`, `state/`, `api/`, `lib/`, plus `types.ts`
and `constants.ts`. State is held in a `useReducer` store with a normalized shape (`byId` map +
`order` array) and exposed through two **separate contexts**: one for state, one for `dispatch`.
Splitting them means components that only dispatch never re-render when notes change, and each
`Note` subscribes to only its own slice, so moving one note never re-renders its siblings. Actions
form a discriminated union and the reducer is checked exhaustively with a `never` assertion, so
adding an action without handling it fails to compile.

All pointer interactions are built on one hand-written primitive, `usePointerDrag` — a generic
gesture engine that captures the pointer (so a drag survives the cursor leaving the element),
reports `requestAnimationFrame`-throttled cumulative deltas, and gates a gesture with an optional
`canStart` predicate. Move, resize, rubber-band-create, and freehand drawing are all thin callers
of it. The **performance strategy** is deliberate: during an active gesture the note element's
`transform` and size are written **directly to the DOM via a ref**, bypassing React entirely; the
reducer is only touched once, on `pointerup`, to commit the final geometry. This keeps dragging at
60 fps regardless of how many notes are on the canvas. The delete zone reuses the same move
gesture, hit-testing the note's live rect against the zone's rect each frame.

Persistence is a **side-effect layer**, kept out of the reducer to keep it pure. A `mockClient`
exposes async `fetchNotes` / `saveNote` / `deleteNote` / `replaceAll` methods with simulated
latency and a `localStorage` backing store; `useNotesPersistence` hydrates the store on mount and
persists changes granularly (per-note save/delete, debounced) on change. Errors funnel through a
single `reportError` sink (ready to wire to a monitoring service). The type system is strict
throughout — a **branded `NoteId`** prevents mixing raw strings with identifiers, the resize
handles are derived from a single tuple of edge/corner literals rather than a hand-maintained
union, and geometry helpers (clamp, resize-from-handle, rect intersection, stroke scaling) are
pure and unit-tested. Correctness is covered by a full test pyramid: Vitest for the reducer,
geometry, hooks, and components; and Playwright end-to-end specs (one per feature plus a full
journey), run across Chromium and Firefox.

### Layout

```
src/
├─ App.tsx                 # app shell: header, Clear-all, loading state, providers
├─ types.ts  constants.ts  # domain types; sizes, thresholds, color token maps
├─ components/             # one folder each: Note, Canvas, ColorPicker, ClearAllButton,
│                          #   DeleteZone, ResizeHandles, DrawingLayer, RubberBand
├─ hooks/                  # usePointerDrag, useRafThrottle, useNoteGestures, useNoteKeyboard,
│                          #   useCreateNote, useDrawing, useAutoGrow, useNotesPersistence
├─ state/                  # reducer, actions, split contexts, selectors, id factory
├─ api/mockClient.ts       # async localStorage-backed REST mock
├─ lib/                    # geometry (clamp/resize/intersect/scale), reportError
└─ test/                   # Vitest setup + render helper + fixtures
e2e/                       # Playwright specs (one per feature + a full journey)
```

## Trade-offs & next steps

With more time: undo/redo (the reducer shape makes this straightforward), viewport virtualization
for very large note counts, a screen-reader-friendly alternative for freehand ink, and swapping
the mock client for a real REST endpoint (the client interface is already the seam for that).
