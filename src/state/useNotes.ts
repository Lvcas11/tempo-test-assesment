import { useContext, useMemo, type ActionDispatch } from 'react'
import type { Note, NoteId } from '@/types'
import type { NotesAction } from './actions'
import { NotesDispatchContext, NotesStateContext } from './context'
import type { NotesState } from './notesReducer'

export function useNotesState(): NotesState {
  const state = useContext(NotesStateContext)
  if (state === null) throw new Error('useNotesState must be used within a NotesProvider')
  return state
}

export function useNotesDispatch(): ActionDispatch<[action: NotesAction]> {
  const dispatch = useContext(NotesDispatchContext)
  if (dispatch === null) throw new Error('useNotesDispatch must be used within a NotesProvider')
  return dispatch
}

/** Note ids in render order — the canvas maps over this to render notes. */
export function useNoteOrder(): readonly NoteId[] {
  return useNotesState().order
}

/** A single note by id. Consumers re-render only when their own note changes. */
export function useNote(id: NoteId): Note {
  const note = useNotesState().byId[id]
  if (!note) throw new Error(`useNote: no note with id ${id}`)
  return note
}

/** The current top z — used to decide whether a click actually needs to promote. */
export function useMaxZ(): number {
  return useNotesState().maxZ
}

/** Convenience: derive the notes array (memoized by state reference). */
export function useNotesList(): readonly Note[] {
  const { order, byId } = useNotesState()
  return useMemo(
    () => order.map((id) => byId[id]).filter((n): n is Note => n != null),
    [order, byId],
  )
}
