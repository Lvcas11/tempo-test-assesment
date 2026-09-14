import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  it('renders the header and canvas', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /sticky notes/i })).toBeInTheDocument()
    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })
})
