import { DEFAULT_LATENCY, STORAGE_KEY } from '@/constants'
import { reportError } from '@/lib/reportError'
import type { Note } from '@/types'

/**
 * An asynchronous, localStorage-backed stand-in for a REST API. Every method
 * returns a Promise with simulated latency so the app exercises real async data
 * flow (loading states) without a server.
 */

export interface NotesClientOptions {
  latency?: number
  /** Injectable failure, used to exercise the persistence error path in tests. */
  shouldFail?: () => boolean
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function readStore(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Note[]) : []
  } catch (error) {
    reportError(error, { source: 'mockClient.readStore' })
    return []
  }
}

function writeStore(notes: readonly Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export interface NotesClient {
  fetchNotes(): Promise<Note[]>
  saveNote(note: Note): Promise<Note>
  deleteNote(id: Note['id']): Promise<void>
  replaceAll(notes: readonly Note[]): Promise<void>
}

export function createNotesClient(options: NotesClientOptions = {}): NotesClient {
  const latency = options.latency ?? DEFAULT_LATENCY
  const failing = () => options.shouldFail?.() ?? false

  return {
    async fetchNotes() {
      await delay(latency)
      return readStore()
    },
    async saveNote(note) {
      await delay(latency)
      if (failing()) throw new Error('mock: saveNote failed')
      const notes = readStore()
      const index = notes.findIndex((n) => n.id === note.id)
      if (index === -1) notes.push(note)
      else notes[index] = note
      writeStore(notes)
      return note
    },
    async deleteNote(id) {
      await delay(latency)
      if (failing()) throw new Error('mock: deleteNote failed')
      writeStore(readStore().filter((n) => n.id !== id))
    },
    async replaceAll(notes) {
      await delay(latency)
      if (failing()) throw new Error('mock: replaceAll failed')
      writeStore(notes)
    },
  }
}
