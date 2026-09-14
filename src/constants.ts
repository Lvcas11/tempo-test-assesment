import type { NoteColor } from './types'
import { NOTE_COLORS } from './types'

/** Minimum note edge length, in px. */
export const MIN_NOTE_SIZE = 120

/** Default note size when a note is created by a click (not a drag). */
export const DEFAULT_NOTE_SIZE = 200

/** Drag distance (px) below which a create gesture counts as a click. */
export const CREATE_DRAG_THRESHOLD = 8

/** Default color assigned to click-created notes. */
export const DEFAULT_NOTE_COLOR = 'yellow' as const

/** localStorage key for persisted notes (versioned to allow future migrations). */
export const STORAGE_KEY = 'sticky-notes/v1'

/** Simulated network latency (ms) for the async mock client. */
export const DEFAULT_LATENCY = 120

/** Debounce (ms) before persisting note changes. */
export const PERSIST_DEBOUNCE = 250

/** Body background token class per color. */
export const NOTE_COLOR_BG: Record<NoteColor, string> = {
  yellow: 'bg-note-yellow',
  green: 'bg-note-green',
  pink: 'bg-note-pink',
  purple: 'bg-note-purple',
  blue: 'bg-note-blue',
  gray: 'bg-note-gray',
}

/** Darker header "accent bar" token class per color. */
export const NOTE_COLOR_BAR: Record<NoteColor, string> = {
  yellow: 'bg-note-yellow-bar',
  green: 'bg-note-green-bar',
  pink: 'bg-note-pink-bar',
  purple: 'bg-note-purple-bar',
  blue: 'bg-note-blue-bar',
  gray: 'bg-note-gray-bar',
}

/** Human-readable labels for the color picker's accessible names. */
export const NOTE_COLOR_LABEL: Record<NoteColor, string> = {
  yellow: 'Yellow',
  green: 'Green',
  pink: 'Pink',
  purple: 'Purple',
  blue: 'Blue',
  gray: 'Gray',
}

export { NOTE_COLORS }
