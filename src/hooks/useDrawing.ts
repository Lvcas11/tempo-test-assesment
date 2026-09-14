import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useNotesDispatch } from '@/state/useNotes'
import type { NoteId, Stroke } from '@/types'

/**
 * Freehand pen capture for a single note. While the pen is active, pointer
 * gestures on the drawing overlay record a polyline in note-local coordinates;
 * the live stroke is exposed for immediate rendering and committed to state on
 * release. Hand-written on the Pointer Events API — no drawing library.
 */
export function useDrawing(id: NoteId, inkColor: string) {
  const dispatch = useNotesDispatch()
  const [liveStroke, setLiveStroke] = useState<Stroke | null>(null)
  const drawingRef = useRef(false)
  // Ref is the source of truth for the in-progress stroke; state mirrors it for
  // rendering. Keeping commit logic off React's state updater avoids double
  // dispatch under StrictMode.
  const liveStrokeRef = useRef<Stroke | null>(null)

  const localPoint = (event: ReactPointerEvent) => {
    const box = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - box.left, y: event.clientY - box.top }
  }

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0) return
      event.stopPropagation()
      event.currentTarget.setPointerCapture(event.pointerId)
      drawingRef.current = true
      const stroke: Stroke = { color: inkColor, points: [localPoint(event)] }
      liveStrokeRef.current = stroke
      setLiveStroke(stroke)
    },
    [inkColor],
  )

  const onPointerMove = useCallback((event: ReactPointerEvent) => {
    if (!drawingRef.current || !liveStrokeRef.current) return
    const point = localPoint(event)
    const next: Stroke = {
      ...liveStrokeRef.current,
      points: [...liveStrokeRef.current.points, point],
    }
    liveStrokeRef.current = next
    setLiveStroke(next)
  }, [])

  const finish = useCallback(
    (event: ReactPointerEvent) => {
      if (!drawingRef.current) return
      drawingRef.current = false
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      // Read the current stroke from the ref, commit once, then clear.
      const stroke = liveStrokeRef.current
      liveStrokeRef.current = null
      if (stroke && stroke.points.length > 1) {
        dispatch({ type: 'ADD_STROKE', id, stroke })
      }
      setLiveStroke(null)
    },
    [dispatch, id],
  )

  return {
    liveStroke,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  }
}
