import { useCallback, useEffect, useRef } from 'react'
import { useRafThrottle } from '@/hooks/useRafThrottle'

/** A point in client coordinates. */
export interface Point {
  x: number
  y: number
}

/** Cumulative deltas from the gesture origin, plus the current point. */
export interface DragState {
  dx: number
  dy: number
  point: Point
}

export interface PointerDragCallbacks<Payload> {
  /** Gate a gesture on the initiating event (e.g. only when pressing the bare surface). */
  canStart?: (event: React.PointerEvent) => boolean
  /** Optional per-gesture context, resolved from the initiating event. */
  onStart?: (start: Point, event: React.PointerEvent) => Payload
  onMove?: (state: DragState, payload: Payload) => void
  onEnd?: (state: DragState, payload: Payload) => void
}

interface ActiveGesture<Payload> {
  pointerId: number
  origin: Point
  payload: Payload
  target: Element
}

/**
 * A reusable pointer-drag engine. Returns an `onPointerDown` handler; once a
 * gesture starts it captures the pointer (so the drag survives the cursor
 * leaving the element), reports rAF-throttled cumulative deltas, and cleans up
 * on pointerup/pointercancel.
 *
 * The hook never calls React state setters during a move — callers use the
 * deltas to write to the DOM directly and commit to state in `onEnd`.
 */
export function usePointerDrag<Payload = void>(callbacks: PointerDragCallbacks<Payload>) {
  const callbacksRef = useRef(callbacks)
  useEffect(() => {
    callbacksRef.current = callbacks
  })

  const gestureRef = useRef<ActiveGesture<Payload> | null>(null)

  const emitMove = useRafThrottle((point: Point) => {
    const gesture = gestureRef.current
    if (!gesture) return
    callbacksRef.current.onMove?.(
      { dx: point.x - gesture.origin.x, dy: point.y - gesture.origin.y, point },
      gesture.payload,
    )
  })

  const finish = useCallback((point: Point) => {
    const gesture = gestureRef.current
    if (!gesture) return
    gestureRef.current = null
    if (gesture.target.hasPointerCapture(gesture.pointerId)) {
      gesture.target.releasePointerCapture(gesture.pointerId)
    }
    callbacksRef.current.onEnd?.(
      { dx: point.x - gesture.origin.x, dy: point.y - gesture.origin.y, point },
      gesture.payload,
    )
  }, [])

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (gestureRef.current?.pointerId !== event.pointerId) return
      emitMove({ x: event.clientX, y: event.clientY })
    },
    [emitMove],
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (gestureRef.current?.pointerId !== event.pointerId) return
      finish({ x: event.clientX, y: event.clientY })
    },
    [finish],
  )

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    // Primary button / touch / pen only; ignore secondary buttons.
    if (event.button !== 0) return
    if (callbacksRef.current.canStart && !callbacksRef.current.canStart(event)) return
    const origin: Point = { x: event.clientX, y: event.clientY }
    const payload = callbacksRef.current.onStart?.(origin, event) as Payload
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    gestureRef.current = { pointerId: event.pointerId, origin, payload, target }
  }, [])

  // Handlers spread onto the draggable element.
  return {
    onPointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
  } as const
}
