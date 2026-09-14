import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Stroke } from '@/types'

interface DrawingLayerProps {
  strokes: readonly Stroke[]
  liveStroke: Stroke | null
  /** When true the layer captures pointer events for drawing; otherwise it's inert. */
  active: boolean
  handlers: {
    onPointerDown: (e: ReactPointerEvent) => void
    onPointerMove: (e: ReactPointerEvent) => void
    onPointerUp: (e: ReactPointerEvent) => void
    onPointerCancel: (e: ReactPointerEvent) => void
  }
}

const toPath = (stroke: Stroke): string =>
  stroke.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

/**
 * Renders committed ink plus the in-progress stroke as SVG paths. Sits above the
 * note body; only intercepts pointer events while pen mode is `active`.
 */
export function DrawingLayer({ strokes, liveStroke, active, handlers }: DrawingLayerProps) {
  const all = liveStroke ? [...strokes, liveStroke] : strokes
  return (
    <svg
      data-testid="drawing-layer"
      className={`absolute inset-0 h-full w-full ${
        active ? 'cursor-crosshair touch-none' : 'pointer-events-none'
      }`}
      {...(active ? handlers : {})}
    >
      {all.map((stroke, i) => (
        <path
          key={i}
          d={toPath(stroke)}
          fill="none"
          stroke={stroke.color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
