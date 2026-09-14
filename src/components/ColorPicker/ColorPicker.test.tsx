import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NOTE_COLORS } from '@/constants'
import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
  it('renders a swatch for every palette color', () => {
    render(<ColorPicker value="yellow" onChange={() => undefined} />)
    for (const color of NOTE_COLORS) {
      expect(screen.getByTestId(`color-${color}`)).toBeInTheDocument()
    }
  })

  it('marks the current color as checked', () => {
    render(<ColorPicker value="green" onChange={() => undefined} />)
    expect(screen.getByTestId('color-green')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('color-yellow')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with the chosen color', async () => {
    const onChange = vi.fn()
    render(<ColorPicker value="yellow" onChange={onChange} />)
    await userEvent.click(screen.getByTestId('color-blue'))
    expect(onChange).toHaveBeenCalledWith('blue')
  })
})
