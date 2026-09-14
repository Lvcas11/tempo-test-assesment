import type { NoteColor } from './types'

/** Minimum note edge length, in px. */
export const MIN_NOTE_SIZE = 120

/** Default note size when a note is created by a click (not a drag). */
export const DEFAULT_NOTE_SIZE = 200

/** Drag distance (px) below which a create gesture counts as a click. */
export const CREATE_DRAG_THRESHOLD = 8

/** Default color assigned to click-created notes. */
export const DEFAULT_NOTE_COLOR = 'yellow' as const

/** Body background token class per color. */
export const NOTE_COLOR_BG: Record<NoteColor, string> = {
  yellow: 'bg-note-yellow',
  green: 'bg-note-green',
  pink: 'bg-note-pink',
  purple: 'bg-note-purple',
  blue: 'bg-note-blue',
  gray: 'bg-note-gray',
}
