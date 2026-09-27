import { useLayoutEffect, type RefObject } from 'react'
import { useNotesDispatch } from '@/state/useNotes'
import type { Note } from '@/types'

/**
 * Grows a note's height to fit its text content. Measures the content element's
 * intrinsic height and, if it exceeds the current body, dispatches a height
 * increase — capped so the note can never grow taller than the canvas (otherwise
 * it would overflow the clipped canvas and become unreachable). Disabled once the
 * user has manually resized (enforced by the reducer).
 *
 * `measureRef` should point at an element whose `scrollHeight` reflects the full
 * (unclipped) text height — the read-only text div or the edit textarea.
 */
export function useAutoGrow(
  note: Note,
  measureRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLElement | null>,
  headerHeight: number,
  padding: number,
) {
  const dispatch = useNotesDispatch()

  useLayoutEffect(() => {
    if (note.manuallyResized) return
    const el = measureRef.current
    if (!el) return

    const wanted = Math.ceil(headerHeight + el.scrollHeight + padding)
    // Cap growth at the canvas height so the note stays fully on-screen; once
    // capped, its text scrolls internally (`.note-scroll`) instead of overflowing.
    const maxHeight = canvasRef.current?.clientHeight ?? wanted
    const needed = Math.min(wanted, maxHeight)

    if (needed > note.rect.height) {
      dispatch({ type: 'AUTO_GROW_NOTE', id: note.id, height: needed })
    }
    // `note.text` drives the mirror's height, so it must trigger a re-measure.
  }, [
    note.text,
    note.manuallyResized,
    note.rect.height,
    note.id,
    measureRef,
    canvasRef,
    headerHeight,
    padding,
    dispatch,
  ])
}
