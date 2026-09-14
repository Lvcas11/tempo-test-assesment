import { useEffect, useRef, useState } from 'react'
import type { NotesClient } from '@/api/mockClient'
import { PERSIST_DEBOUNCE } from '@/constants'
import { reportError } from '@/lib/reportError'
import { useNotesDispatch, useNotesList } from '@/state/useNotes'
import type { Note, NoteId } from '@/types'

/**
 * Bridges the reducer to the async client: hydrates notes on mount, then
 * persists changes (debounced) whenever they change. Persistence is granular —
 * only changed/new notes are saved and only removed notes are deleted — so a
 * per-note edit doesn't rewrite the whole collection. The initial load is skipped
 * for persistence so hydration itself never triggers a write.
 */
export function useNotesPersistence(client: NotesClient): { loading: boolean } {
  const dispatch = useNotesDispatch()
  const notes = useNotesList()
  const [loading, setLoading] = useState(true)
  const hydratedRef = useRef(false)
  // Snapshot of the last-persisted notes, keyed by id, to diff against.
  const persistedRef = useRef<Map<NoteId, Note>>(new Map())

  // Hydrate once.
  useEffect(() => {
    let cancelled = false
    client
      .fetchNotes()
      .then((loaded) => {
        if (cancelled) return
        dispatch({ type: 'LOAD_NOTES', notes: loaded })
        persistedRef.current = new Map(loaded.map((n) => [n.id, n]))
        hydratedRef.current = true
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        reportError(error, { source: 'useNotesPersistence.fetchNotes' })
        hydratedRef.current = true
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client, dispatch])

  // Persist deltas on change (debounced), but not during the initial hydration.
  useEffect(() => {
    if (!hydratedRef.current) return
    const handle = setTimeout(() => {
      const prev = persistedRef.current
      const next = new Map(notes.map((n) => [n.id, n]))

      // Upsert notes that are new or changed by reference.
      for (const note of notes) {
        if (prev.get(note.id) !== note) {
          void client.saveNote(note).catch((error: unknown) => {
            reportError(error, { source: 'useNotesPersistence.saveNote', id: note.id })
          })
        }
      }
      // Delete notes that no longer exist.
      for (const id of prev.keys()) {
        if (!next.has(id)) {
          void client.deleteNote(id).catch((error: unknown) => {
            reportError(error, { source: 'useNotesPersistence.deleteNote', id })
          })
        }
      }

      persistedRef.current = next
    }, PERSIST_DEBOUNCE)
    return () => clearTimeout(handle)
  }, [client, notes])

  return { loading }
}
