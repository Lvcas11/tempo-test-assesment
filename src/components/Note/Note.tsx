import { memo, useRef, useState, type RefObject } from 'react'
import { useNote, useNotesDispatch } from '@/state/useNotes'
import { useNoteGestures } from '@/hooks/useNoteGestures'
import { useNoteKeyboard } from '@/hooks/useNoteKeyboard'
import { useDrawing } from '@/hooks/useDrawing'
import { useAutoGrow } from '@/hooks/useAutoGrow'
import { NOTE_COLOR_BAR, NOTE_COLOR_BG } from '@/constants'
import type { NoteId } from '@/types'
import { ColorPicker } from '@/components/ColorPicker'
import { ResizeHandles } from '@/components/ResizeHandles'
import { DrawingLayer } from '@/components/DrawingLayer'

/** Ink color used by the pen — a deep, legible tone. */
const INK = 'var(--color-ink)'

interface NoteProps {
  id: NoteId
  canvasRef: RefObject<HTMLElement | null>
  /** When true (a freshly created note), open in edit mode with a focused caret. */
  autoFocus?: boolean
}

const HEADER_HEIGHT = 38
/** Total vertical text padding (py-3 top + bottom = 24px). */
const TEXT_PADDING_Y = 24

/**
 * A single sticky note. Reads only its own slice from state, so it re-renders
 * only when that note changes. During move the element is mutated directly by
 * `useNoteGestures`; React commits the final geometry on release.
 */
function NoteComponent({ id, canvasRef, autoFocus = false }: NoteProps) {
  const note = useNote(id)
  const dispatch = useNotesDispatch()
  const elementRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  // A freshly created note starts in edit mode so the user can type immediately.
  const [isEditing, setIsEditing] = useState(autoFocus)
  const [isDrawing, setIsDrawing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const { move, resize } = useNoteGestures({ note, elementRef, canvasRef })
  const onHandleKeyDown = useNoteKeyboard(note, canvasRef)
  const { liveStroke, handlers: drawHandlers } = useDrawing(id, INK)
  useAutoGrow(note, measureRef, HEADER_HEIGHT, TEXT_PADDING_Y)

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
      className={`group absolute top-0 left-0 touch-none rounded-note shadow-note ring-accent/50 ring-offset-canvas transition-shadow duration-300 ease-note select-none hover:shadow-note-lifted focus-within:shadow-note-lifted focus-within:ring-2 focus-within:ring-offset-2 ${NOTE_COLOR_BG[note.color]}`}
    >
      {/* Content wrapper clips the rounded corners; resize handles live outside it. */}
      <div className="flex h-full w-full flex-col overflow-hidden rounded-note">
        {/* Accent bar — the drag affordance, and the keyboard entry point:
            focus it and use arrow keys to move, Alt+arrows to resize. */}
        <div
          {...move}
          data-testid="note-drag-handle"
          role="button"
          tabIndex={0}
          aria-label="Move note. Use arrow keys to move, Alt with arrow keys to resize, Delete to remove."
          onKeyDown={onHandleKeyDown}
          style={{ height: HEADER_HEIGHT }}
          className={`flex flex-none cursor-grab items-center justify-between px-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:cursor-grabbing ${NOTE_COLOR_BAR[note.color]}`}
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
              aria-label={isDrawing ? 'Switch to write mode' : 'Switch to draw mode'}
              aria-pressed={isDrawing}
              title={isDrawing ? 'Draw mode — click for write mode' : 'Draw mode'}
              data-testid="note-pen"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setIsDrawing((v) => !v)}
              className={`grid h-8 w-8 place-items-center rounded-md transition-colors ease-note focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                isDrawing
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-ink/70 hover:bg-black/10 hover:text-ink'
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 20l4-1L19 8a2 2 0 0 0-3-3L5 16l-1 4z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
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
              className="note-scroll h-full w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink outline-none"
            />
          ) : (
            <div
              data-testid="note-text"
              onDoubleClick={() => setIsEditing(true)}
              className="note-scroll h-full w-full overflow-x-hidden overflow-y-auto px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-ink"
            >
              {note.text ||
                // Hide the hint while drawing so it doesn't sit behind the ink.
                (!isDrawing && <span className="text-ink/45">Double-click to edit</span>)}
            </div>
          )}

          {/* Hidden mirror: intrinsic height of the text drives auto-grow. */}
          <div
            ref={measureRef}
            aria-hidden="true"
            className="pointer-events-none invisible absolute top-0 left-0 w-full px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap"
          >
            {note.text ? note.text + '\n' : ' '}
          </div>

          <DrawingLayer
            strokes={note.strokes}
            liveStroke={liveStroke}
            active={isDrawing}
            handlers={drawHandlers}
          />
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
