import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Note, NoteId } from '@/types'
import { createNotesClient } from './mockClient'

const note = (id: string): Note => ({
  id: id as NoteId,
  rect: { x: 0, y: 0, width: 200, height: 200 },
  text: '',
  color: 'yellow',
  z: 1,
  strokes: [],
  manuallyResized: false,
})

describe('mockClient', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('returns an empty list when nothing is stored', async () => {
    const client = createNotesClient({ latency: 0 })
    await expect(client.fetchNotes()).resolves.toEqual([])
  })

  it('persists a saved note and reads it back', async () => {
    const client = createNotesClient({ latency: 0 })
    await client.saveNote(note('a'))
    const notes = await client.fetchNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0]?.id).toBe('a')
  })

  it('updates an existing note in place rather than duplicating', async () => {
    const client = createNotesClient({ latency: 0 })
    await client.saveNote(note('a'))
    await client.saveNote({ ...note('a'), text: 'updated' })
    const notes = await client.fetchNotes()
    expect(notes).toHaveLength(1)
    expect(notes[0]?.text).toBe('updated')
  })

  it('deletes a note', async () => {
    const client = createNotesClient({ latency: 0 })
    await client.saveNote(note('a'))
    await client.deleteNote('a' as NoteId)
    await expect(client.fetchNotes()).resolves.toEqual([])
  })

  it('rejects and writes nothing when the injected failure fires', async () => {
    const client = createNotesClient({ latency: 0, shouldFail: () => true })
    await expect(client.saveNote(note('a'))).rejects.toThrow(/saveNote failed/)
    // A failed save must not have persisted anything — the persistence layer
    // relies on rejection here to funnel the error to reportError().
    const clean = createNotesClient({ latency: 0 })
    await expect(clean.fetchNotes()).resolves.toEqual([])
  })

  it('is asynchronous (does not resolve synchronously)', () => {
    const client = createNotesClient({ latency: 5 })
    let resolved = false
    void client.fetchNotes().then(() => (resolved = true))
    expect(resolved).toBe(false)
  })
})
