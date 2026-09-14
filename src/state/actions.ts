import type { Handle, Note, NoteColor, NoteId, Rect, Stroke } from '@/types'

/**
 * All state transitions as a discriminated union. Every mutation the UI can
 * perform is one of these; the reducer handles them exhaustively.
 */
export type NotesAction =
  | { type: 'LOAD_NOTES'; notes: readonly Note[] }
  | { type: 'CREATE_NOTE'; id: NoteId; rect: Rect; color: NoteColor }
  | { type: 'MOVE_NOTE'; id: NoteId; x: number; y: number }
  | { type: 'RESIZE_NOTE'; id: NoteId; rect: Rect }
  | { type: 'AUTO_GROW_NOTE'; id: NoteId; height: number }
  | { type: 'REMOVE_NOTE'; id: NoteId }
  | { type: 'CLEAR_ALL' }
  | { type: 'EDIT_TEXT'; id: NoteId; text: string }
  | { type: 'SET_COLOR'; id: NoteId; color: NoteColor }
  | { type: 'ADD_STROKE'; id: NoteId; stroke: Stroke }
  | { type: 'BRING_TO_FRONT'; id: NoteId }

export type NotesActionType = NotesAction['type']

/** Narrow a union member by its `type` — handy for typing action creators/tests. */
export type ActionOf<T extends NotesActionType> = Extract<NotesAction, { type: T }>

/** Payload of a given action (everything except the discriminant). */
export type PayloadOf<T extends NotesActionType> = Omit<ActionOf<T>, 'type'>

// Resize handle is referenced by feature code; re-exported for a single import site.
export type { Handle }
