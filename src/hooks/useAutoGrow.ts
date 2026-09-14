import { useLayoutEffect, type RefObject } from 'react'
import { useNotesDispatch } from '@/state/useNotes'
import type { Note } from '@/types'

/**
 * Grows a note's height to fit its text content. Measures the content element's
 * intrinsic height and, if it exceeds the current body, dispatches a height
 * increase. Disabled once the user has manually resized (enforced by the reducer).
 *
 * `measureRef` should point at an element whose `scrollHeight` reflects the full
 * (unclipped) text height — the read-only text div or the edit textarea.
 */
export function useAutoGrow(
  note: Note,
  measureRef: RefObject<HTMLElement | null>,
  headerHeight: number,
  padding: number,
) {
  const dispatch = useNotesDispatch()

  useLayoutEffect(() => {
    if (note.manuallyResized) return
    const el = measureRef.current
    if (!el) return
    const needed = Math.ceil(headerHeight + el.scrollHeight + padding)
    if (needed > note.rect.height) {
      dispatch({ type: 'AUTO_GROW_NOTE', id: note.id, height: needed })
    }
  })
}
