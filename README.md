# Lucas Giuri — Tempo — Sticky Notes Test

Hi! This is the final result of my test. First of all, thank you so much for the opportunity — it
was an interesting take-home and I genuinely enjoyed it.

## How I approached it

I turned the assessment PDF into a markdown brief and used it as the objective for a planning pass,
adding some extra context of my own: the tech stack, how to structure the code (components, hooks,
state, utils), and a few product ideas — a **Microsoft Sticky Notes** look, with sensible default
colors and sizes. My proposal was to **plan first, then execute in small increments**: write out
every ticket up front, and once the plan was complete, build the features **one ticket at a time,
with a dedicated pull request for each**. The result is a clean, reviewable history where every PR
is self-contained and passes the full quality gate (format, lint, type-check, unit, build, e2e).

## Overview

It is a single-page sticky-notes application where the user can:
- Create notes on a canvas
- Move the note dragging it,
- Draw freehand ink on them.
- Type on the note.
- Change the colour of the note
- Delete the note (dragging into the right side or clicking on the X).
- Resize the note.
- Edit their content (text and draw).
- Persist across reloads through an asynchronous, `localStorage`-backed mock API.

Developed using Claude Code as an assistant of the entire development process, including the brainstorming plan, the tickets creation and coding.

## Features

**Core** — create a note of a specified size at a specified position (rubber-band drag, or click for
a default note), move by dragging, resize by dragging (invisible edge/corner grab zones), and delete
notes (× button, "Clear all", or drag onto the right-edge delete zone).

**Bonus & extras** — inline text editing with auto-grow and scroll, freehand drawing (pen mode),
bring-to-front on interaction (z-order), six note colors, full keyboard control
(move / resize / delete), and asynchronous persistence to `localStorage` (restored on load).

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

### Scripts

```bash
npm run build         # type-check + production build
npm run preview       # preview the production build
npm run typecheck     # tsc --noEmit (strict)
npm run lint          # ESLint (type-aware, zero warnings)
npm run format:check  # Prettier
npm run test          # Vitest unit / component tests
npm run test:e2e      # Playwright end-to-end tests (Chromium + Firefox)
```

Playwright browsers are needed once for the e2e suite: `npx playwright install`.

## Usage

- **Create a note** — drag anywhere on the empty canvas to draw one at exactly the size and spot you
  want, or just click to drop a default-size note. Either way it opens ready to type.
- **Move it** — grab the colored bar at the top and drag. **Resize it** — grab any edge or corner
  (there are no visible handles; the cursor changes when you're over a spot you can pull).
- **Edit the text** — double-click the note. `⌘/Ctrl + Enter` saves, `Esc` discards. The note grows
  as you write, and once you've sized it yourself it just scrolls instead.
- **Draw on it** — flip on the pen in the note's toolbar and sketch freehand. Your strokes scale
  along with the note when you resize it.
- **Change the color** — click the color dot on the note's bar to open the palette.
- **Delete it** — hit the × on the note, drag it over to the **delete zone** on the right edge, or
  wipe everything with **Clear all** in the top bar (it asks first).
- **Keyboard** — focus a note's bar and use the arrow keys to move it, `Alt` + arrows to resize, and
  `Delete` to remove it.

## Browser support

Built for desktop, down to 1024×768. Works on the latest Chrome, Firefox, and Edge — and the e2e
suite runs on both Chromium (which stands in for Chrome and Edge) and Firefox, so that support isn't
just a claim.

## Architecture

Everything lives in a **flat `src/`** — no deep `features/` nesting, since this is a single-domain
app. You'll find `components/` (each component in its own folder with a colocated test and a barrel),
`hooks/`, `state/`, `api/`, `lib/`, and two small files, `types.ts` and `constants.ts`.

**State.** A `useReducer` store holds the notes in a normalized shape (a `byId` map plus an `order`
array), and I hand it out through two _separate_ contexts — one for the state, one for `dispatch`.
That split matters: a component that only needs to dispatch never re-renders when the notes change,
and each `Note` reads only its own slice, so dragging one note doesn't re-render the others. The
actions are a discriminated union and the reducer handles them exhaustively (with a `never` check),
so if I ever add an action and forget to handle it, the build fails instead of the app.

**Interactions.** Every gesture — move, resize, rubber-band create, freehand drawing — is built on a
single hand-written hook, `usePointerDrag`. It captures the pointer (so a drag keeps working even if
the cursor leaves the element), reports `requestAnimationFrame`-throttled deltas, and can veto a
gesture up front via a `canStart` check. The performance trick is deliberate: while you're dragging,
the note's `transform` and size are written **straight to the DOM through a ref**, skipping React
entirely — the reducer only hears about it once, on release. That's what keeps dragging smooth at 60
fps no matter how many notes are on screen. The delete zone piggybacks on the same move gesture,
checking each frame whether the note overlaps it.

**Persistence.** I kept this as a side-effect layer so the reducer stays pure. A `mockClient` fakes a
REST API — `fetchNotes` / `saveNote` / `deleteNote` / `replaceAll`, all async with a bit of simulated
latency, backed by `localStorage`. `useNotesPersistence` loads notes on startup and then saves
changes as they happen, per-note and debounced rather than rewriting everything. Anything that throws
goes through a single `reportError` sink that's ready to point at a real monitoring service.

**Types & tests.** Typing is strict everywhere. A **branded `NoteId`** stops me from accidentally
passing a plain string where an id belongs, the resize handles come from one source-of-truth tuple
instead of a union I'd have to keep in sync, and the geometry helpers (clamp, resize-from-handle,
intersection, stroke scaling) are pure and unit-tested. Coverage is a real pyramid: Vitest for the
reducer, geometry, hooks and components, and Playwright end-to-end specs — one per feature plus a
full end-to-end journey — running on both Chromium and Firefox.

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
├─ lib/                    # geometry (clamp / resize / intersect / scale), reportError
└─ test/                   # Vitest setup + render helper + fixtures
e2e/                       # Playwright specs (one per feature + a full journey)
```

## Trade-offs & next steps

With more time I would add: undo/redo (the reducer shape makes this straightforward), viewport
virtualization for very large note counts, a screen-reader-friendly alternative for freehand ink,
and swapping the mock client for a real REST endpoint — the client interface is already the seam for
that.
