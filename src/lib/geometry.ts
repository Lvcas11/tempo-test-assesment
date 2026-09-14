import type { Handle, Rect, Stroke } from '@/types'

export interface Size {
  width: number
  height: number
}

/** Move a rect by a delta, preserving its size. */
export function translateRect(rect: Rect, dx: number, dy: number): Rect {
  return { ...rect, x: rect.x + dx, y: rect.y + dy }
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

/**
 * Keep a rect fully inside `bounds`. If the rect is larger than the bounds on
 * an axis it is pinned to the origin on that axis rather than pushed negative.
 */
export function clampRectToBounds(rect: Rect, bounds: Size): Rect {
  const maxX = Math.max(0, bounds.width - rect.width)
  const maxY = Math.max(0, bounds.height - rect.height)
  return {
    ...rect,
    x: Math.min(Math.max(0, rect.x), maxX),
    y: Math.min(Math.max(0, rect.y), maxY),
  }
}

/** Convert a possibly-negative-size rect (drawn any direction) to top-left origin + positive size. */
export function normalizeRect(rect: Rect): Rect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x
  const y = rect.height < 0 ? rect.y + rect.height : rect.y
  return { x, y, width: Math.abs(rect.width), height: Math.abs(rect.height) }
}

/** Strict overlap — rects that merely share an edge do not intersect. */
export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

const movesWest = (h: Handle): boolean => h === 'w' || h === 'nw' || h === 'sw'
const movesNorth = (h: Handle): boolean => h === 'n' || h === 'ne' || h === 'nw'
const affectsX = (h: Handle): boolean => h !== 'n' && h !== 's'
const affectsY = (h: Handle): boolean => h !== 'e' && h !== 'w'

/**
 * Resize `rect` by dragging `handle` a delta of `(dx, dy)`.
 *
 * West/north handles move the origin as the size changes; east/south handles keep
 * the origin fixed. The minimum size is enforced by anchoring the opposite edge,
 * so shrinking past the limit never flips or drifts the rect.
 */
export function resizeRect(
  rect: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  minSize: number,
): Rect {
  let { x, y, width, height } = rect

  if (affectsX(handle)) {
    if (movesWest(handle)) {
      const right = x + width
      x = Math.min(x + dx, right - minSize)
      width = right - x
    } else {
      width = Math.max(minSize, width + dx)
    }
  }

  if (affectsY(handle)) {
    if (movesNorth(handle)) {
      const bottom = y + height
      y = Math.min(y + dy, bottom - minSize)
      height = bottom - y
    } else {
      height = Math.max(minSize, height + dy)
    }
  }

  return { x, y, width, height }
}
