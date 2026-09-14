import { useCallback, type KeyboardEvent, type RefObject } from 'react'
import { clampRectToBounds, resizeRect } from '@/lib/geometry'
import { MIN_NOTE_SIZE } from '@/constants'
import { useNotesDispatch } from '@/state/useNotes'
import type { Note } from '@/types'

/** Nudge distance per key press; larger with Shift for coarse movement. */
const STEP = 8
const STEP_LARGE = 32

/**
 * Keyboard control for a focused note's drag handle: arrow keys move the note,
 * Alt+arrow keys resize it (from the SE corner). Delete/Backspace removes it.
 * Movement/resize is clamped to the canvas, mirroring the pointer gestures.
 */
export function useNoteKeyboard(note: Note, canvasRef: RefObject<HTMLElement | null>) {
  const dispatch = useNotesDispatch()

  return useCallback(
    (event: KeyboardEvent) => {
      const canvas = canvasRef.current
      const step = event.shiftKey ? STEP_LARGE : STEP
      const bounds = { width: canvas?.clientWidth ?? 0, height: canvas?.clientHeight ?? 0 }

      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        dispatch({ type: 'REMOVE_NOTE', id: note.id })
        return
      }

      const d = delta[event.key]
      if (!d) return
      event.preventDefault()
      dispatch({ type: 'BRING_TO_FRONT', id: note.id })

      if (event.altKey) {
        // Resize from the south-east corner.
        const resized = resizeRect(note.rect, 'se', d[0], d[1], MIN_NOTE_SIZE)
        dispatch({ type: 'RESIZE_NOTE', id: note.id, rect: clampRectToBounds(resized, bounds) })
      } else {
        const moved = clampRectToBounds(
          { ...note.rect, x: note.rect.x + d[0], y: note.rect.y + d[1] },
          bounds,
        )
        dispatch({ type: 'MOVE_NOTE', id: note.id, x: moved.x, y: moved.y })
      }
    },
    [dispatch, note.id, note.rect, canvasRef],
  )
}
