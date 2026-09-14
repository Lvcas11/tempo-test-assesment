import { useRef } from 'react'
import { useNoteOrder } from '@/state/useNotes'
import { useCreateNote } from '@/hooks/useCreateNote'
import { Note } from '@/components/Note'
import { RubberBand } from '@/components/RubberBand'

/**
 * The notes surface. Owns the canvas element ref (shared with every note for
 * bounds/coordinate math) and hosts the create-by-drawing gesture.
 */
export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const order = useNoteOrder()
  const { handlers: createHandlers, preview, lastCreatedId } = useCreateNote(canvasRef)

  return (
    <div
      ref={canvasRef}
      data-testid="canvas"
      aria-label="Notes canvas"
      className="relative h-full w-full touch-none overflow-hidden bg-canvas"
      {...createHandlers}
    >
      {order.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="mx-auto max-w-xs text-center">
            <p className="text-base font-medium text-ink">No notes yet</p>
            <p className="mt-2 text-sm text-ink-muted">
              Drag anywhere to draw a note, or click to drop one
            </p>
          </div>
        </div>
      )}

      {order.map((id) => (
        <Note key={id} id={id} autoFocus={id === lastCreatedId} />
      ))}

      {preview && <RubberBand rect={preview} />}
    </div>
  )
}
