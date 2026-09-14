import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  beforeEach(() => localStorage.clear())

  it('renders the header immediately', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /sticky notes/i })).toBeInTheDocument()
  })

  it('renders the canvas once notes have loaded', async () => {
    render(<App />)
    // The workspace hydrates asynchronously; the canvas appears after loading.
    expect(await screen.findByTestId('canvas')).toBeInTheDocument()
  })
})
