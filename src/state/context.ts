import { createContext, type ActionDispatch } from 'react'
import type { NotesAction } from './actions'
import type { NotesState } from './notesReducer'

/**
 * State and dispatch live in separate contexts so that components which only
 * dispatch never re-render when the notes change. `dispatch` is stable for the
 * app's lifetime.
 */
export const NotesStateContext = createContext<NotesState | null>(null)
export const NotesDispatchContext = createContext<ActionDispatch<[action: NotesAction]> | null>(
  null,
)
