import { useState } from 'react'
import { useNoteOrder, useNotesDispatch } from '@/state/useNotes'

/**
 * Navbar action that clears the whole board. Uses a two-step inline confirm to
 * prevent accidental wipes, and hides itself when there are no notes.
 */
export function ClearAllButton() {
  const dispatch = useNotesDispatch()
  const order = useNoteOrder()
  const [confirming, setConfirming] = useState(false)

  // Nothing to clear — render nothing (and treat as not-confirming).
  if (order.length === 0) return null

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs" role="group" aria-label="Confirm clear all">
        <span className="text-ink-muted">Delete all {order.length} notes?</span>
        <button
          type="button"
          data-testid="clear-all-confirm"
          onClick={() => {
            dispatch({ type: 'CLEAR_ALL' })
            setConfirming(false)
          }}
          className="rounded-md bg-danger px-2.5 py-1 font-medium text-white transition-colors ease-note hover:opacity-90 focus-visible:ring-2 focus-visible:ring-danger focus-visible:outline-none"
        >
          Delete all
        </button>
        <button
          type="button"
          data-testid="clear-all-cancel"
          onClick={() => setConfirming(false)}
          className="rounded-md px-2 py-1 text-ink-muted transition-colors ease-note hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      data-testid="clear-all"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors ease-note hover:bg-black/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Clear all
    </button>
  )
}
