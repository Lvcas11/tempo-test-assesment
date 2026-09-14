import { memo, useRef, useState, type RefObject } from 'react'
import { useNote, useNotesDispatch } from '@/state/useNotes'
import { useNoteGestures } from '@/hooks/useNoteGestures'
import { NOTE_COLOR_BAR, NOTE_COLOR_BG } from '@/constants'
import type { NoteId } from '@/types'
import { ColorPicker } from '@/components/ColorPicker'
import { ResizeHandles } from '@/components/ResizeHandles'

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
  const [pickerOpen, setPickerOpen] = useState(false)

  const { move, resize } = useNoteGestures({ note, elementRef, canvasRef })

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
      className={`group absolute top-0 left-0 touch-none rounded-note shadow-note ${NOTE_COLOR_BG[note.color]}`}
    >
      {/* Content wrapper clips the rounded corners; resize handles live outside it. */}
      <div className="flex h-full w-full flex-col overflow-hidden rounded-note">
        {/* Accent bar — the drag affordance. */}
        <div
          {...move}
          data-testid="note-drag-handle"
          style={{ height: HEADER_HEIGHT }}
          className={`flex flex-none cursor-grab items-center justify-between px-2 active:cursor-grabbing ${NOTE_COLOR_BAR[note.color]}`}
        >
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Change color"
              aria-haspopup="true"
              aria-expanded={pickerOpen}
              data-testid="note-color-toggle"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setPickerOpen((v) => !v)}
              className="grid h-8 w-8 place-items-center rounded-md text-ink/70 opacity-0 transition-[opacity,background-color] duration-150 ease-note group-hover:opacity-100 hover:bg-black/10 hover:text-ink focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 ease-note group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              aria-label="Delete note"
              data-testid="note-delete"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => dispatch({ type: 'REMOVE_NOTE', id })}
              className="grid h-8 w-8 place-items-center rounded-md text-ink/70 transition-colors ease-note hover:bg-danger/15 hover:text-danger focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

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

      {/* Color popover — sits outside the clipped content so all swatches show. */}
      {pickerOpen && (
        <div
          style={{ top: HEADER_HEIGHT + 4 }}
          className="absolute left-2 z-30 w-max rounded-xl border border-hairline bg-surface p-2 shadow-note-lifted"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ColorPicker
            value={note.color}
            onChange={(color) => {
              dispatch({ type: 'SET_COLOR', id, color })
              setPickerOpen(false)
            }}
          />
        </div>
      )}

      <ResizeHandles
        onHandlePointerDown={resize.onPointerDown}
        onHandlePointerMove={resize.onPointerMove}
        onHandlePointerUp={resize.onPointerUp}
        onHandlePointerCancel={resize.onPointerCancel}
      />
    </div>
  )
}

export const Note = memo(NoteComponent)
