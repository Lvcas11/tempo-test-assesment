/**
 * App shell. Feature UI (canvas, notes, delete zone) is wired in later tickets;
 * for now this establishes the layout frame and design tokens.
 */
export default function App() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-hairline bg-surface px-6 py-3">
        <h1 className="text-base font-semibold tracking-tight text-ink">Sticky Notes</h1>
        <p className="text-xs text-ink-muted">Drag on the canvas to create a note</p>
      </header>
      <main
        data-testid="canvas"
        className="relative flex-1 overflow-hidden bg-canvas"
        aria-label="Notes canvas"
      >
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="text-sm text-ink-muted">No notes yet</p>
        </div>
      </main>
    </div>
  )
}
