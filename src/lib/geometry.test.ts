import { describe, expect, it } from 'vitest'
import type { Rect, Stroke } from '@/types'
import {
  clampRectToBounds,
  normalizeRect,
  rectsIntersect,
  resizeRect,
  scaleStrokes,
  translateRect,
} from './geometry'

const rect = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
})

describe('translateRect', () => {
  it('shifts position by the delta and preserves size', () => {
    expect(translateRect(rect(10, 20, 100, 50), 5, -8)).toEqual(rect(15, 12, 100, 50))
  })
})

describe('clampRectToBounds', () => {
  const bounds = { width: 1000, height: 800 }

  it('leaves an in-bounds rect unchanged', () => {
    expect(clampRectToBounds(rect(10, 10, 100, 100), bounds)).toEqual(rect(10, 10, 100, 100))
  })

  it('clamps a rect past the left/top edges to 0', () => {
    expect(clampRectToBounds(rect(-30, -40, 100, 100), bounds)).toEqual(rect(0, 0, 100, 100))
  })

  it('clamps a rect past the right/bottom edges', () => {
    expect(clampRectToBounds(rect(980, 780, 100, 100), bounds)).toEqual(rect(900, 700, 100, 100))
  })

  it('does not push a rect larger than the bounds into negatives', () => {
    const clamped = clampRectToBounds(rect(0, 0, 1200, 900), bounds)
    expect(clamped.x).toBe(0)
    expect(clamped.y).toBe(0)
  })
})

describe('normalizeRect', () => {
  it('keeps a positive-size rect as-is', () => {
    expect(normalizeRect(rect(10, 10, 40, 30))).toEqual(rect(10, 10, 40, 30))
  })

  it('flips a negative-width/height rect so size is positive', () => {
    // Drawn from bottom-right to top-left.
    expect(normalizeRect(rect(100, 100, -40, -30))).toEqual(rect(60, 70, 40, 30))
  })
})

describe('rectsIntersect', () => {
  it('returns true for overlapping rects', () => {
    expect(rectsIntersect(rect(0, 0, 50, 50), rect(25, 25, 50, 50))).toBe(true)
  })

  it('returns false for disjoint rects', () => {
    expect(rectsIntersect(rect(0, 0, 50, 50), rect(100, 100, 50, 50))).toBe(false)
  })

  it('returns false when rects only touch at an edge', () => {
    expect(rectsIntersect(rect(0, 0, 50, 50), rect(50, 0, 50, 50))).toBe(false)
  })
})

describe('resizeRect', () => {
  const start = rect(100, 100, 200, 200)
  const minSize = 40

  it('grows from the south-east corner (origin fixed)', () => {
    expect(resizeRect(start, 'se', 30, 40, minSize)).toEqual(rect(100, 100, 230, 240))
  })

  it('grows from the north-west corner (origin moves)', () => {
    expect(resizeRect(start, 'nw', -20, -10, minSize)).toEqual(rect(80, 90, 220, 210))
  })

  it('resizes a single axis for an edge handle', () => {
    // East edge: width changes, height untouched.
    expect(resizeRect(start, 'e', 50, 999, minSize)).toEqual(rect(100, 100, 250, 200))
    // South edge: height changes, width untouched.
    expect(resizeRect(start, 's', 999, 25, minSize)).toEqual(rect(100, 100, 200, 225))
  })

  it('enforces the minimum size when shrinking from the south-east', () => {
    const r = resizeRect(start, 'se', -500, -500, minSize)
    expect(r.width).toBe(minSize)
    expect(r.height).toBe(minSize)
  })

  it('enforces the minimum size from the north-west without moving the origin past the far edge', () => {
    const r = resizeRect(start, 'nw', 500, 500, minSize)
    expect(r.width).toBe(minSize)
    expect(r.height).toBe(minSize)
    // The far (south-east) corner must stay anchored at 300,300.
    expect(r.x + r.width).toBe(300)
    expect(r.y + r.height).toBe(300)
  })
})

describe('scaleStrokes', () => {
  const stroke = (...points: [number, number][]): Stroke => ({
    color: '#000',
    points: points.map(([x, y]) => ({ x, y })),
  })

  it('scales points proportionally when the note grows', () => {
    const result = scaleStrokes(
      [stroke([10, 20], [30, 40])],
      { width: 100, height: 100 },
      { width: 200, height: 200 },
    )
    expect(result[0]?.points).toEqual([
      { x: 20, y: 40 },
      { x: 60, y: 80 },
    ])
  })

  it('returns the same reference when size is unchanged', () => {
    const strokes = [stroke([1, 1])]
    expect(scaleStrokes(strokes, { width: 100, height: 100 }, { width: 100, height: 100 })).toBe(
      strokes,
    )
  })

  it('treats a zero source dimension as identity (no division by zero)', () => {
    const result = scaleStrokes(
      [stroke([5, 5])],
      { width: 0, height: 100 },
      { width: 200, height: 50 },
    )
    expect(result[0]?.points[0]?.x).toBe(5) // x unchanged (from.width was 0)
    expect(result[0]?.points[0]?.y).toBe(2.5) // y halved
  })
})
