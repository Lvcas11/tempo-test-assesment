import type { NotesState } from '@/state/notesReducer'
import type { Note, NoteId } from '@/types'

/** Build a Note with sensible defaults for tests. */
export function makeNote(over: Partial<Note> & Pick<Note, 'id'>): Note {
  return {
    id: over.id,
    rect: over.rect ?? { x: 0, y: 0, width: 200, height: 200 },
    text: over.text ?? '',
    color: over.color ?? 'yellow',
    z: over.z ?? 1,
    strokes: over.strokes ?? [],
    manuallyResized: over.manuallyResized ?? false,
  }
}

/** Build a NotesState seeded with the given notes. */
export function makeState(...notes: Note[]): NotesState {
  return {
    byId: Object.fromEntries(notes.map((n) => [n.id, n])),
    order: notes.map((n) => n.id),
    maxZ: notes.reduce((max, n) => Math.max(max, n.z), 0),
  }
}

export const noteId = (s: string): NoteId => s as NoteId
