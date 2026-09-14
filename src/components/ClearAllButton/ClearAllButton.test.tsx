import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { makeNote, makeState, noteId } from '@/test/fixtures'
import { renderWithNotes } from '@/test/renderWithNotes'
import { ClearAllButton } from './ClearAllButton'

describe('ClearAllButton', () => {
  it('renders nothing when there are no notes', () => {
    renderWithNotes(<ClearAllButton />)
    expect(screen.queryByTestId('clear-all')).not.toBeInTheDocument()
  })

  it('shows a count-aware confirm, then clears on confirm', async () => {
    const state = makeState(makeNote({ id: noteId('a') }), makeNote({ id: noteId('b') }))
    renderWithNotes(<ClearAllButton />, { initialState: state })

    await userEvent.click(screen.getByTestId('clear-all'))
    expect(screen.getByText(/delete all 2 notes\?/i)).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('clear-all-confirm'))
    // Board is now empty → the button disappears.
    expect(screen.queryByTestId('clear-all')).not.toBeInTheDocument()
  })

  it('keeps notes when the confirm is cancelled', async () => {
    const state = makeState(makeNote({ id: noteId('a') }))
    renderWithNotes(<ClearAllButton />, { initialState: state })

    await userEvent.click(screen.getByTestId('clear-all'))
    await userEvent.click(screen.getByTestId('clear-all-cancel'))
    // Back to the default button (notes still present).
    expect(screen.getByTestId('clear-all')).toBeInTheDocument()
  })
})
