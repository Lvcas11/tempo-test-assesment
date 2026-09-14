import { memo, useState } from 'react'
import { useNote, useNotesDispatch } from '@/state/useNotes'
import { NOTE_COLOR_BG } from '@/constants'
import type { NoteId } from '@/types'

interface NoteProps {
  id: NoteId
  /** When true (a freshly created note), open in edit mode with a focused caret. */
  autoFocus?: boolean
}

/**
 * A single sticky note. Reads only its own slice from state, so it re-renders
 * only when that note changes. Move/resize/draw are wired in later tickets.
 */
function NoteComponent({ id, autoFocus = false }: NoteProps) {
  const note = useNote(id)
  const dispatch = useNotesDispatch()
  // A freshly created note starts in edit mode so the user can type immediately.
  const [isEditing, setIsEditing] = useState(autoFocus)

  const commitText = (text: string) => {
    setIsEditing(false)
    if (text !== note.text) dispatch({ type: 'EDIT_TEXT', id, text })
  }

  return (
    <div
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
      className={`absolute top-0 left-0 flex touch-none flex-col rounded-note shadow-note ${NOTE_COLOR_BG[note.color]}`}
    >
      {isEditing ? (
        <textarea
          autoFocus
          defaultValue={note.text}
          data-testid="note-textarea"
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
  )
}

export const Note = memo(NoteComponent)
