import type { Rect } from '@/types'

/** The live preview rectangle shown while drawing a new note. */
export function RubberBand({ rect }: { rect: Rect }) {
  return (
    <div
      data-testid="rubber-band"
      className="pointer-events-none absolute z-40 rounded-note border-2 border-accent/70 bg-accent/5"
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.width,
        height: rect.height,
      }}
    />
  )
}
