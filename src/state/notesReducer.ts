import { scaleStrokes } from '@/lib/geometry'
import type { Note, NoteId } from '@/types'
import type { NotesAction } from './actions'

/**
 * Normalized state: a lookup map plus an explicit order array. Lookups are O(1)
 * and updating one note produces a new reference only for that note, which keeps
 * `React.memo`'d note components from re-rendering when siblings change.
 */
export interface NotesState {
  byId: Readonly<Record<NoteId, Note>>
  order: readonly NoteId[]
  /** Highest z currently in use; new/promoted notes take maxZ + 1. */
  maxZ: number
}

export const initialNotesState: NotesState = {
  byId: {},
  order: [],
  maxZ: 0,
}

/** Immutably replace one note, returning the same state reference if it is missing. */
function updateNote(
  state: NotesState,
  id: NoteId,
  update: (note: Note) => Note,
  patch?: Partial<NotesState>,
): NotesState {
  const current = state.byId[id]
  if (!current) return state
  const nextNote = update(current)
  if (nextNote === current && !patch) return state
  return {
    ...state,
    ...patch,
    byId: { ...state.byId, [id]: nextNote },
  }
}

export function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'LOAD_NOTES': {
      // Normalize so notes persisted before newer fields existed stay valid.
      const notes = action.notes.map((n) => ({
        ...n,
        strokes: n.strokes ?? [],
        manuallyResized: n.manuallyResized ?? false,
      }))
      const byId = Object.fromEntries(notes.map((n) => [n.id, n])) as Record<NoteId, Note>
      const maxZ = notes.reduce((max, n) => Math.max(max, n.z), 0)
      return { byId, order: notes.map((n) => n.id), maxZ }
    }

    case 'CREATE_NOTE': {
      const z = state.maxZ + 1
      const note: Note = {
        id: action.id,
        rect: action.rect,
        text: '',
        color: action.color,
        z,
        strokes: [],
        manuallyResized: false,
      }
      return {
        byId: { ...state.byId, [action.id]: note },
        order: [...state.order, action.id],
        maxZ: z,
      }
    }

    case 'MOVE_NOTE':
      return updateNote(state, action.id, (n) => ({
        ...n,
        rect: { ...n.rect, x: action.x, y: action.y },
      }))

    case 'RESIZE_NOTE':
      // A manual resize pins the height, disables auto-grow, and rescales any
      // freehand ink so it stays anchored to the note's content.
      return updateNote(state, action.id, (n) => ({
        ...n,
        rect: action.rect,
        strokes: scaleStrokes(
          n.strokes,
          { width: n.rect.width, height: n.rect.height },
          { width: action.rect.width, height: action.rect.height },
        ),
        manuallyResized: true,
      }))

    case 'AUTO_GROW_NOTE':
      return updateNote(state, action.id, (n) =>
        n.manuallyResized || n.rect.height === action.height
          ? n
          : { ...n, rect: { ...n.rect, height: action.height } },
      )

    case 'EDIT_TEXT':
      return updateNote(state, action.id, (n) =>
        n.text === action.text ? n : { ...n, text: action.text },
      )

    case 'SET_COLOR':
      return updateNote(state, action.id, (n) =>
        n.color === action.color ? n : { ...n, color: action.color },
      )

    case 'ADD_STROKE':
      return updateNote(state, action.id, (n) => ({
        ...n,
        strokes: [...n.strokes, action.stroke],
      }))

    case 'BRING_TO_FRONT': {
      const current = state.byId[action.id]
      if (!current || current.z === state.maxZ) return state
      const z = state.maxZ + 1
      return updateNote(state, action.id, (n) => ({ ...n, z }), { maxZ: z })
    }

    case 'REMOVE_NOTE': {
      if (!state.byId[action.id]) return state
      const byId = { ...state.byId }
      delete byId[action.id]
      return {
        ...state,
        byId,
        order: state.order.filter((id) => id !== action.id),
      }
    }

    case 'CLEAR_ALL':
      return state.order.length === 0 ? state : initialNotesState

    default: {
      // Exhaustiveness guard: adding an action without handling it fails to compile.
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}
