import { Canvas } from '@/components/Canvas'
import { NotesProvider } from '@/state/NotesProvider'

export default function App() {
  return (
    <NotesProvider>
      <div className="flex h-full flex-col">
        <header className="z-10 flex items-center justify-between border-b border-hairline bg-surface px-6 py-3">
          <h1 className="text-base font-semibold tracking-tight text-ink">Sticky Notes</h1>
          <p className="text-xs text-ink-muted">Drag on the canvas to create a note</p>
        </header>
        <main className="relative flex-1 overflow-hidden">
          <Canvas />
        </main>
      </div>
    </NotesProvider>
  )
}
