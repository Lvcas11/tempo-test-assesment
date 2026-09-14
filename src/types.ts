/**
 * Domain types for the notes feature.
 *
 * The type system is deliberately strict: a branded id prevents mixing plain
 * strings with note identifiers, actions form a discriminated union so the
 * reducer can be checked exhaustively, and resize handles are derived from a
 * single source-of-truth tuple rather than a hand-maintained union.
 */

/** Branded identifier — a plain string cannot be used where a NoteId is expected. */
export type NoteId = string & { readonly __brand: 'NoteId' }

/** Axis-aligned rectangle in canvas coordinates. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** The palette keys; the concrete colors live in the design tokens. */
export const NOTE_COLORS = ['yellow', 'green', 'pink', 'purple', 'blue', 'gray'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

/** A single freehand pen stroke: a polyline of points in note-local coordinates. */
export interface Stroke {
  color: string
  points: readonly { x: number; y: number }[]
}

export interface Note {
  readonly id: NoteId
  rect: Rect
  text: string
  color: NoteColor
  /** Stacking order; higher sits in front. */
  z: number
  /** Freehand ink strokes drawn on the note, in note-local coordinates. */
  strokes: readonly Stroke[]
  /** Once the user manually resizes, auto-grow-to-fit-text is disabled. */
  manuallyResized: boolean
}

/**
 * Resize handles as a tuple → the `Handle` union is derived, never hand-written.
 * Order: cardinal edges then corners.
 */
export const HANDLES = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'] as const
export type Handle = (typeof HANDLES)[number]

/** Corner handles resize two axes; edge handles resize one. */
export type Corner = Extract<Handle, 'ne' | 'se' | 'sw' | 'nw'>
export type Edge = Exclude<Handle, Corner>
