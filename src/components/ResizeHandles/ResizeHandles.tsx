import type { PointerEvent } from 'react'
import { HANDLES, type Handle } from '@/types'

interface ResizeHandlesProps {
  onHandlePointerDown: (event: PointerEvent) => void
  onHandlePointerMove: (event: PointerEvent) => void
  onHandlePointerUp: (event: PointerEvent) => void
  onHandlePointerCancel: (event: PointerEvent) => void
}

/** Thickness of the invisible edge grab bands, and the corner square size, in px. */
const EDGE = 8
const CORNER = 16

/**
 * Invisible hit-zone geometry per handle. Edges are thin bands along a side;
 * corners are small squares. Each shows the appropriate resize cursor on hover —
 * no visible chrome, so a note reads clean until you reach for an edge.
 */
const HANDLE_STYLE: Record<Handle, string> = {
  n: 'top-0 right-2 left-2 cursor-ns-resize',
  s: 'bottom-0 right-2 left-2 cursor-ns-resize',
  e: 'top-2 right-0 bottom-2 cursor-ew-resize',
  w: 'top-2 bottom-2 left-0 cursor-ew-resize',
  ne: 'top-0 right-0 cursor-nesw-resize',
  se: 'right-0 bottom-0 cursor-nwse-resize',
  sw: 'bottom-0 left-0 cursor-nesw-resize',
  nw: 'top-0 left-0 cursor-nwse-resize',
}

/** Edge bands stretch along one axis; corner squares are fixed EDGE×EDGE. */
function sizeFor(handle: Handle): { width?: number; height?: number } {
  switch (handle) {
    case 'n':
    case 's':
      return { height: EDGE }
    case 'e':
    case 'w':
      return { width: EDGE }
    default:
      return { width: CORNER, height: CORNER }
  }
}

export function ResizeHandles({
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onHandlePointerCancel,
}: ResizeHandlesProps) {
  return (
    <>
      {HANDLES.map((handle) => (
        <span
          key={handle}
          aria-hidden="true"
          data-handle={handle}
          data-testid={`resize-${handle}`}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerCancel}
          style={sizeFor(handle)}
          className={`absolute z-10 touch-none ${HANDLE_STYLE[handle]}`}
        />
      ))}
    </>
  )
}
