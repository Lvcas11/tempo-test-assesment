import { forwardRef } from 'react'

interface DeleteZoneProps {
  /** Whether a note is currently being dragged (controls slide-in visibility). */
  visible: boolean
  /** Whether a note is hovering over the zone (controls the armed visual). */
  armed: boolean
}

/**
 * A vertical delete strip docked to the right edge. Hidden at rest; it slides in
 * while a note is being dragged and arms (turns red, lifts) when the note is over
 * it. Dropping a note here deletes it.
 */
export const DeleteZone = forwardRef<HTMLDivElement, DeleteZoneProps>(function DeleteZone(
  { visible, armed },
  ref,
) {
  return (
    <div
      ref={ref}
      data-testid="delete-zone"
      data-armed={armed}
      data-visible={visible}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 right-0 z-40 flex w-40 items-center justify-center p-3 transition-[transform,opacity] duration-300 ease-note ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {/* Inner card — the actual drop target visual. */}
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed backdrop-blur-sm transition-all duration-200 ease-note ${
          armed
            ? 'scale-[1.03] border-danger bg-danger/15 text-danger shadow-note-lifted'
            : 'border-hairline bg-surface/60 text-ink-muted shadow-note'
        }`}
      >
        <div
          className={`grid place-items-center rounded-full transition-all duration-200 ease-note ${
            armed ? 'h-16 w-16 bg-danger/15' : 'h-14 w-14 bg-black/5'
          }`}
        >
          <svg
            width={armed ? 34 : 28}
            height={armed ? 34 : 28}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="transition-all duration-200 ease-note"
          >
            <path
              d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7M10 11v6M14 11v6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="px-2 text-center text-sm font-semibold tracking-tight">
          {armed ? 'Release to delete' : 'Drop to delete'}
        </span>
      </div>
    </div>
  )
})
