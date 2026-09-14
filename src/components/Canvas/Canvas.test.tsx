import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeNote, makeState, noteId } from '@/test/fixtures'
import { renderWithNotes } from '@/test/renderWithNotes'
import { Canvas } from './Canvas'

describe('Canvas', () => {
  it('shows the empty state when there are no notes', () => {
    renderWithNotes(<Canvas />)
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
  })

  it('renders a note for each entry in state and hides the empty state', () => {
    const state = makeState(
      makeNote({ id: noteId('a') }),
      makeNote({ id: noteId('b'), rect: { x: 300, y: 0, width: 200, height: 200 } }),
    )
    renderWithNotes(<Canvas />, { initialState: state })

    expect(screen.getAllByTestId('note')).toHaveLength(2)
    expect(screen.queryByText(/no notes yet/i)).not.toBeInTheDocument()
  })
})
