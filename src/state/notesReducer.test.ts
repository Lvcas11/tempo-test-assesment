import { describe, expect, it } from 'vitest'
import type { Note, NoteId } from '@/types'
import { initialNotesState, notesReducer, type NotesState } from './notesReducer'

const id = (s: string): NoteId => s as NoteId

const note = (over: Partial<Note> & Pick<Note, 'id'>): Note => ({
  id: over.id,
  rect: over.rect ?? { x: 0, y: 0, width: 200, height: 200 },
  text: over.text ?? '',
  color: over.color ?? 'yellow',
  z: over.z ?? 1,
  strokes: over.strokes ?? [],
  manuallyResized: over.manuallyResized ?? false,
})

const withNotes = (...notes: Note[]): NotesState => ({
  ...initialNotesState,
  order: notes.map((n) => n.id),
  byId: Object.fromEntries(notes.map((n) => [n.id, n])),
  maxZ: notes.reduce((max, n) => Math.max(max, n.z), 0),
})

describe('notesReducer', () => {
  it('LOAD_NOTES replaces state and derives order + maxZ', () => {
    const a = note({ id: id('a'), z: 3 })
    const b = note({ id: id('b'), z: 7 })
    const next = notesReducer(initialNotesState, { type: 'LOAD_NOTES', notes: [a, b] })
    expect(next.order).toEqual([id('a'), id('b')])
    expect(next.byId[id('b')]).toEqual(b)
    expect(next.maxZ).toBe(7)
  })

  it('CREATE_NOTE adds a note on top with an incremented z', () => {
    const start = withNotes(note({ id: id('a'), z: 5 }))
    const next = notesReducer(start, {
      type: 'CREATE_NOTE',
      id: id('b'),
      rect: { x: 10, y: 20, width: 150, height: 120 },
      color: 'blue',
    })
    expect(next.order).toEqual([id('a'), id('b')])
    expect(next.byId[id('b')]?.z).toBe(6)
    expect(next.maxZ).toBe(6)
    expect(next.byId[id('b')]?.color).toBe('blue')
  })

  it('MOVE_NOTE updates only position', () => {
    const start = withNotes(note({ id: id('a'), rect: { x: 0, y: 0, width: 200, height: 200 } }))
    const next = notesReducer(start, { type: 'MOVE_NOTE', id: id('a'), x: 40, y: 60 })
    expect(next.byId[id('a')]?.rect).toEqual({ x: 40, y: 60, width: 200, height: 200 })
  })

  it('RESIZE_NOTE replaces the rect', () => {
    const start = withNotes(note({ id: id('a') }))
    const rect = { x: 5, y: 5, width: 80, height: 90 }
    const next = notesReducer(start, { type: 'RESIZE_NOTE', id: id('a'), rect })
    expect(next.byId[id('a')]?.rect).toEqual(rect)
  })

  it('REMOVE_NOTE deletes from both order and byId', () => {
    const start = withNotes(note({ id: id('a') }), note({ id: id('b') }))
    const next = notesReducer(start, { type: 'REMOVE_NOTE', id: id('a') })
    expect(next.order).toEqual([id('b')])
    expect(next.byId[id('a')]).toBeUndefined()
  })

  it('CLEAR_ALL empties the board', () => {
    const start = withNotes(note({ id: id('a') }), note({ id: id('b') }))
    const next = notesReducer(start, { type: 'CLEAR_ALL' })
    expect(next.order).toEqual([])
    expect(next.byId).toEqual({})
  })

  it('CLEAR_ALL is a no-op on an already-empty board', () => {
    const next = notesReducer(initialNotesState, { type: 'CLEAR_ALL' })
    expect(next).toBe(initialNotesState)
  })

  it('RESIZE_NOTE marks the note as manually resized', () => {
    const start = withNotes(note({ id: id('a') }))
    const rect = { x: 0, y: 0, width: 300, height: 300 }
    const next = notesReducer(start, { type: 'RESIZE_NOTE', id: id('a'), rect })
    expect(next.byId[id('a')]?.manuallyResized).toBe(true)
  })

  it('RESIZE_NOTE rescales freehand strokes with the note', () => {
    const start = withNotes(
      note({
        id: id('a'),
        rect: { x: 0, y: 0, width: 100, height: 100 },
        strokes: [{ color: '#000', points: [{ x: 50, y: 50 }] }],
      }),
    )
    const next = notesReducer(start, {
      type: 'RESIZE_NOTE',
      id: id('a'),
      rect: { x: 0, y: 0, width: 200, height: 200 },
    })
    expect(next.byId[id('a')]?.strokes[0]?.points[0]).toEqual({ x: 100, y: 100 })
  })

  it('AUTO_GROW_NOTE grows the height when not manually resized', () => {
    const start = withNotes(note({ id: id('a'), rect: { x: 0, y: 0, width: 200, height: 200 } }))
    const next = notesReducer(start, { type: 'AUTO_GROW_NOTE', id: id('a'), height: 320 })
    expect(next.byId[id('a')]?.rect.height).toBe(320)
  })

  it('AUTO_GROW_NOTE is ignored once the note was manually resized', () => {
    const start = withNotes(
      note({ id: id('a'), manuallyResized: true, rect: { x: 0, y: 0, width: 200, height: 200 } }),
    )
    const next = notesReducer(start, { type: 'AUTO_GROW_NOTE', id: id('a'), height: 320 })
    expect(next).toBe(start)
  })

  it('ADD_STROKE appends a stroke', () => {
    const start = withNotes(note({ id: id('a') }))
    const stroke = {
      color: '#000',
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ],
    }
    const next = notesReducer(start, { type: 'ADD_STROKE', id: id('a'), stroke })
    expect(next.byId[id('a')]?.strokes).toHaveLength(1)
    expect(next.byId[id('a')]?.strokes[0]).toEqual(stroke)
  })

  it('EDIT_TEXT sets the text', () => {
    const start = withNotes(note({ id: id('a') }))
    const next = notesReducer(start, { type: 'EDIT_TEXT', id: id('a'), text: 'hello' })
    expect(next.byId[id('a')]?.text).toBe('hello')
  })

  it('SET_COLOR sets the color', () => {
    const start = withNotes(note({ id: id('a'), color: 'yellow' }))
    const next = notesReducer(start, { type: 'SET_COLOR', id: id('a'), color: 'green' })
    expect(next.byId[id('a')]?.color).toBe('green')
  })

  it('BRING_TO_FRONT raises z above all others', () => {
    const start = withNotes(note({ id: id('a'), z: 1 }), note({ id: id('b'), z: 2 }))
    const next = notesReducer(start, { type: 'BRING_TO_FRONT', id: id('a') })
    expect(next.byId[id('a')]?.z).toBe(3)
    expect(next.maxZ).toBe(3)
  })

  it('BRING_TO_FRONT is a no-op when already on top', () => {
    const start = withNotes(note({ id: id('a'), z: 1 }), note({ id: id('b'), z: 2 }))
    const next = notesReducer(start, { type: 'BRING_TO_FRONT', id: id('b') })
    expect(next).toBe(start)
  })

  it('ignores actions targeting an unknown id', () => {
    const start = withNotes(note({ id: id('a') }))
    const next = notesReducer(start, { type: 'MOVE_NOTE', id: id('zzz'), x: 1, y: 1 })
    expect(next).toBe(start)
  })
})
