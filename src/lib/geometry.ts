import type { Stroke } from '@/types'

export interface Size {
  width: number
  height: number
}

/**
 * Rescale freehand strokes (in note-local coords) from an old note size to a new
 * one, so ink stays anchored to the note's content as it is resized. A zero old
 * dimension is treated as identity to avoid division by zero.
 */
export function scaleStrokes(strokes: readonly Stroke[], from: Size, to: Size): readonly Stroke[] {
  const sx = from.width === 0 ? 1 : to.width / from.width
  const sy = from.height === 0 ? 1 : to.height / from.height
  if (sx === 1 && sy === 1) return strokes
  return strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((p) => ({ x: p.x * sx, y: p.y * sy })),
  }))
}
