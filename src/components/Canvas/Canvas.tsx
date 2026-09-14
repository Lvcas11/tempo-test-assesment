import { useCallback, useMemo, useRef, useState } from 'react'
import { useNoteOrder } from '@/state/useNotes'
import { useCreateNote } from '@/hooks/useCreateNote'
import { Note } from '@/components/Note'
import { RubberBand } from '@/components/RubberBand'
import { DeleteZone } from '@/components/DeleteZone'
import { DeleteZoneContext, type DeleteZoneApi } from '@/components/DeleteZone/DeleteZoneContext'

/**
 * The notes surface. Owns the canvas element ref (shared with every note for
 * bounds/coordinate math), hosts the create-by-drawing gesture, and provides the
 * right-edge delete zone that notes hit-test against while being dragged.
 */
export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const deleteRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [armed, setArmed] = useState(false)
  const order = useNoteOrder()
  const { handlers: createHandlers, preview, lastCreatedId } = useCreateNote(canvasRef)

  const setDraggingCb = useCallback((v: boolean) => setDragging(v), [])
  const setArmedCb = useCallback((v: boolean) => setArmed(v), [])
  const deleteApi = useMemo<DeleteZoneApi>(
    () => ({ ref: deleteRef, setDragging: setDraggingCb, setArmed: setArmedCb }),
    [setDraggingCb, setArmedCb],
  )

  return (
    <DeleteZoneContext.Provider value={deleteApi}>
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
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                className="mx-auto mb-4 opacity-60"
              >
                <rect
                  x="9"
                  y="9"
                  width="30"
                  height="30"
                  rx="6"
                  stroke="var(--color-hairline)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M17 20h14M17 26h9"
                  stroke="var(--color-hairline)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-base font-medium text-ink">No notes yet</p>
              <p className="mt-2 text-sm text-ink-muted">
                Drag anywhere to draw a note, or click to drop one
              </p>
            </div>
          </div>
        )}

        {order.map((id) => (
          <Note key={id} id={id} canvasRef={canvasRef} autoFocus={id === lastCreatedId} />
        ))}

        {preview && <RubberBand rect={preview} />}

        <DeleteZone ref={deleteRef} visible={dragging} armed={armed} />
      </div>
    </DeleteZoneContext.Provider>
  )
}
