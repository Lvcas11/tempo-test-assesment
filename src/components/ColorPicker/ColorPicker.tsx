import type { NoteColor } from '@/types'
import { NOTE_COLOR_BG, NOTE_COLOR_LABEL, NOTE_COLORS } from '@/constants'

interface ColorPickerProps {
  value: NoteColor
  onChange: (color: NoteColor) => void
}

/** A compact, hand-built swatch row for choosing a note color. */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div role="radiogroup" aria-label="Note color" className="flex items-center gap-1.5">
      {NOTE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={color === value}
          aria-label={NOTE_COLOR_LABEL[color]}
          data-testid={`color-${color}`}
          // Stop the pointerdown from starting a note drag.
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onChange(color)}
          className={`h-7 w-7 rounded-full border transition-transform duration-150 ease-note hover:scale-110 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
            NOTE_COLOR_BG[color]
          } ${color === value ? 'border-ink/50 ring-2 ring-ink/25' : 'border-black/10'}`}
        />
      ))}
    </div>
  )
}
