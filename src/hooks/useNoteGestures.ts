import { useRef, type RefObject } from 'react'
import { clampRectToBounds } from '@/lib/geometry'
import { useNotesDispatch } from '@/state/useNotes'
import type { Note, Rect } from '@/types'
import { usePointerDrag } from './usePointerDrag'

interface UseNoteGesturesArgs {
  note: Note
  /** The note's own DOM element, mutated directly during a gesture. */
  elementRef: RefObject<HTMLDivElement | null>
  /** The canvas element, used to clamp within bounds and convert coordinates. */
  canvasRef: RefObject<HTMLElement | null>
}

/** Apply a rect to the note element via inline styles (bypasses React during a gesture). */
function paint(el: HTMLDivElement, rect: Rect): void {
  el.style.transform = `translate(${rect.x}px, ${rect.y}px)`
  el.style.width = `${rect.width}px`
  el.style.height = `${rect.height}px`
}

/**
 * Wires move (drag on the accent bar) for one note. During a gesture the note
 * element is updated directly; state is committed only on release. Resize and
 * delete-zone hit-testing are added in later tickets.
 */
export function useNoteGestures({ note, elementRef, canvasRef }: UseNoteGesturesArgs) {
  const dispatch = useNotesDispatch()
  const liveRect = useRef<Rect>(note.rect)

  const move = usePointerDrag<Rect>({
    // A press on a button or the text editor must not start a move.
    canStart: (event) => {
      const target = event.target as HTMLElement
      return !target.closest('button, textarea')
    },
    onStart: () => {
      dispatch({ type: 'BRING_TO_FRONT', id: note.id })
      return note.rect
    },
    onMove: ({ dx, dy }, origin) => {
      const el = elementRef.current
      const canvas = canvasRef.current
      if (!el || !canvas) return
      const next = clampRectToBounds(
        { ...origin, x: origin.x + dx, y: origin.y + dy },
        { width: canvas.clientWidth, height: canvas.clientHeight },
      )
      liveRect.current = next
      paint(el, next)
    },
    onEnd: () => {
      const rect = liveRect.current
      dispatch({ type: 'MOVE_NOTE', id: note.id, x: rect.x, y: rect.y })
    },
  })

  return { move }
}
