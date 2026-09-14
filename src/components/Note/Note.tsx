import { memo, useRef, useState, type RefObject } from 'react'
import { useNote, useNotesDispatch } from '@/state/useNotes'
import { useNoteGestures } from '@/hooks/useNoteGestures'
import { NOTE_COLOR_BAR, NOTE_COLOR_BG } from '@/constants'
import type { NoteId } from '@/types'

interface NoteProps {
  id: NoteId
  canvasRef: RefObject<HTMLElement | null>
  /** When true (a freshly created note), open in edit mode with a focused caret. */
  autoFocus?: boolean
}

const HEADER_HEIGHT = 38

/**
 * A single sticky note. Reads only its own slice from state, so it re-renders
 * only when that note changes. During move the element is mutated directly by
 * `useNoteGestures`; React commits the final geometry on release.
 */
function NoteComponent({ id, canvasRef, autoFocus = false }: NoteProps) {
  const note = useNote(id)
  const dispatch = useNotesDispatch()
  const elementRef = useRef<HTMLDivElement>(null)
  // A freshly created note starts in edit mode so the user can type immediately.
  const [isEditing, setIsEditing] = useState(autoFocus)

  const { move } = useNoteGestures({ note, elementRef, canvasRef })

  const commitText = (text: string) => {
    setIsEditing(false)
    if (text !== note.text) dispatch({ type: 'EDIT_TEXT', id, text })
  }

  return (
    <div
      ref={elementRef}
      data-testid="note"
      data-note-id={id}
      role="group"
      aria-label="Sticky note"
      style={{
        transform: `translate(${note.rect.x}px, ${note.rect.y}px)`,
        width: note.rect.width,
        height: note.rect.height,
        zIndex: note.z,
      }}
      className={`group absolute top-0 left-0 flex touch-none flex-col overflow-hidden rounded-note shadow-note ${NOTE_COLOR_BG[note.color]}`}
    >
      {/* Accent bar — the drag affordance. */}
      <div
        {...move}
        data-testid="note-drag-handle"
        style={{ height: HEADER_HEIGHT }}
        className={`flex flex-none cursor-grab items-center justify-between px-2 active:cursor-grabbing ${NOTE_COLOR_BAR[note.color]}`}
      />

      <div className="relative min-h-0 flex-1">
        {isEditing ? (
          <textarea
            autoFocus
            defaultValue={note.text}
            data-testid="note-textarea"
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={(e) => commitText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                setIsEditing(false)
              } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                commitText((e.target as HTMLTextAreaElement).value)
              }
            }}
            className="h-full w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink outline-none"
          />
        ) : (
          <div
            data-testid="note-text"
            onDoubleClick={() => setIsEditing(true)}
            className="h-full w-full overflow-auto px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-ink"
          >
            {note.text || <span className="text-ink/45">Double-click to edit</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export const Note = memo(NoteComponent)
