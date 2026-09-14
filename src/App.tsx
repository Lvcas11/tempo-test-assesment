import { useMemo } from 'react'
import { Canvas } from '@/components/Canvas'
import { ClearAllButton } from '@/components/ClearAllButton'
import { createNotesClient } from '@/api/mockClient'
import { useNotesPersistence } from '@/hooks/useNotesPersistence'
import { NotesProvider } from '@/state/NotesProvider'

function NotesWorkspace() {
  // A single client instance for the app's lifetime.
  const client = useMemo(() => createNotesClient(), [])
  const { loading } = useNotesPersistence(client)

  return (
    <div className="flex h-full flex-col">
      <header className="z-10 flex items-center justify-between gap-4 border-b border-hairline bg-surface px-6 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold tracking-tight text-ink">Sticky Notes</h1>
          <p className="hidden text-xs text-ink-muted sm:block">
            Drag on the canvas to create a note
          </p>
        </div>
        <ClearAllButton />
      </header>
      <main className="relative flex-1 overflow-hidden">
        {loading ? (
          <div className="grid h-full place-items-center">
            <p className="text-sm text-ink-muted" role="status">
              Loading…
            </p>
          </div>
        ) : (
          <Canvas />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <NotesProvider>
      <NotesWorkspace />
    </NotesProvider>
  )
}
