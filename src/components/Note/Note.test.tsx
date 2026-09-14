import { createRef } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeNote, makeState, noteId } from '@/test/fixtures'
import { renderWithNotes } from '@/test/renderWithNotes'
import { Note } from './Note'

const renderNote = (over: Parameters<typeof makeNote>[0]) => {
  const note = makeNote(over)
  const canvasRef = createRef<HTMLElement>()
  const utils = renderWithNotes(<Note id={note.id} canvasRef={canvasRef} />, {
    initialState: makeState(note),
  })
  return { note, ...utils }
}

describe('Note', () => {
  it('renders the note text', () => {
    renderNote({ id: noteId('a'), text: 'Hello world' })
    expect(screen.getByTestId('note-text')).toHaveTextContent('Hello world')
  })

  it('shows a placeholder when empty', () => {
    renderNote({ id: noteId('a'), text: '' })
    expect(screen.getByText(/double-click to edit/i)).toBeInTheDocument()
  })

  it('applies the color background class', () => {
    renderNote({ id: noteId('a'), color: 'green' })
    expect(screen.getByTestId('note')).toHaveClass('bg-note-green')
  })

  it('double-clicking opens the text editor', async () => {
    renderNote({ id: noteId('a'), text: 'x' })
    await userEvent.dblClick(screen.getByTestId('note-text'))
    expect(screen.getByTestId('note-textarea')).toBeInTheDocument()
  })

  it('toggles pen mode via aria-pressed', async () => {
    renderNote({ id: noteId('a') })
    const pen = screen.getByTestId('note-pen')
    expect(pen).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(pen)
    expect(pen).toHaveAttribute('aria-pressed', 'true')
  })
})
