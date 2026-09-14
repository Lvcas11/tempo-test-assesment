import { useRef, useState, type RefObject } from 'react'
import { clampRectToBounds, normalizeRect } from '@/lib/geometry'
import { useNotesDispatch } from '@/state/useNotes'
import { createNoteId } from '@/state/createNoteId'
import {
  CREATE_DRAG_THRESHOLD,
  DEFAULT_NOTE_COLOR,
  DEFAULT_NOTE_SIZE,
  MIN_NOTE_SIZE,
} from '@/constants'
import type { NoteId, Rect } from '@/types'
import { usePointerDrag } from './usePointerDrag'

/**
 * Create-by-drawing on the empty canvas. Dragging rubber-bands a rectangle that
 * becomes the note's position and size in one gesture; a click (below the drag
 * threshold) drops a default-size note centered on the pointer.
 */
export function useCreateNote(canvasRef: RefObject<HTMLElement | null>) {
  const dispatch = useNotesDispatch()
  const [preview, setPreview] = useState<Rect | null>(null)
  // The id of the note just created — the matching Note opens focused for typing.
  const [lastCreatedId, setLastCreatedId] = useState<NoteId | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)

  const toLocal = (clientX: number, clientY: number) => {
    const box = canvasRef.current?.getBoundingClientRect()
    return { x: clientX - (box?.left ?? 0), y: clientY - (box?.top ?? 0) }
  }

  const handlers = usePointerDrag<void>({
    // Only draw when the press lands on the bare canvas, not on a note child.
    canStart: (event) => event.target === event.currentTarget,
    onStart: (point) => {
      originRef.current = toLocal(point.x, point.y)
    },
    onMove: ({ point }) => {
      const origin = originRef.current
      if (!origin) return
      const now = toLocal(point.x, point.y)
      setPreview(
        normalizeRect({
          x: origin.x,
          y: origin.y,
          width: now.x - origin.x,
          height: now.y - origin.y,
        }),
      )
    },
    onEnd: ({ dx, dy, point }) => {
      const origin = originRef.current
      originRef.current = null
      setPreview(null)
      if (!origin) return
      const canvas = canvasRef.current
      const bounds = { width: canvas?.clientWidth ?? 0, height: canvas?.clientHeight ?? 0 }

      const isClick = Math.hypot(dx, dy) < CREATE_DRAG_THRESHOLD
      let rect: Rect
      if (isClick) {
        rect = {
          x: origin.x - DEFAULT_NOTE_SIZE / 2,
          y: origin.y - DEFAULT_NOTE_SIZE / 2,
          width: DEFAULT_NOTE_SIZE,
          height: DEFAULT_NOTE_SIZE,
        }
      } else {
        const now = toLocal(point.x, point.y)
        const drawn = normalizeRect({
          x: origin.x,
          y: origin.y,
          width: now.x - origin.x,
          height: now.y - origin.y,
        })
        rect = {
          ...drawn,
          width: Math.max(MIN_NOTE_SIZE, drawn.width),
          height: Math.max(MIN_NOTE_SIZE, drawn.height),
        }
      }

      const id = createNoteId()
      dispatch({
        type: 'CREATE_NOTE',
        id,
        rect: clampRectToBounds(rect, bounds),
        color: DEFAULT_NOTE_COLOR,
      })
      setLastCreatedId(id)
    },
  })

  return { handlers, preview, lastCreatedId }
}
