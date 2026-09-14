import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePointerDrag, type DragState } from './usePointerDrag'

// Run rAF callbacks synchronously so throttled moves are observable in tests.
let rafQueue: FrameRequestCallback[] = []
beforeEach(() => {
  rafQueue = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.push(cb)
    return rafQueue.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
})
afterEach(() => vi.unstubAllGlobals())
const flushRaf = () => {
  const q = rafQueue
  rafQueue = []
  q.forEach((cb) => cb(0))
}

interface HarnessProps {
  onStart?: () => string
  onMove?: (s: DragState, payload: string) => void
  onEnd?: (s: DragState, payload: string) => void
}

function Harness({ onStart, onMove, onEnd }: HarnessProps) {
  const handlers = usePointerDrag<string>({
    onStart: () => onStart?.() ?? '',
    ...(onMove ? { onMove } : {}),
    ...(onEnd ? { onEnd } : {}),
  })
  return (
    <div data-testid="target" {...handlers}>
      drag me
    </div>
  )
}

describe('usePointerDrag', () => {
  it('reports cumulative deltas relative to the origin during a gesture', () => {
    const onMove = vi.fn()
    render(<Harness onMove={onMove} />)
    const target = screen.getByTestId('target')

    fireEvent.pointerDown(target, { pointerId: 1, button: 0, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 130, clientY: 140 })
    flushRaf()

    expect(onMove).toHaveBeenCalledTimes(1)
    expect(onMove.mock.calls[0]?.[0]).toMatchObject({ dx: 30, dy: 40 })
  })

  it('passes the payload from onStart through to move and end', () => {
    const onEnd = vi.fn()
    render(<Harness onStart={() => 'ctx'} onEnd={onEnd} />)
    const target = screen.getByTestId('target')

    fireEvent.pointerDown(target, { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(target, { pointerId: 1, clientX: 10, clientY: 5 })

    expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ dx: 10, dy: 5 }), 'ctx')
  })

  it('captures the pointer on down and releases it on up', () => {
    render(<Harness />)
    const target = screen.getByTestId('target')

    fireEvent.pointerDown(target, { pointerId: 7, button: 0, clientX: 0, clientY: 0 })
    expect(target.hasPointerCapture(7)).toBe(true)

    fireEvent.pointerUp(target, { pointerId: 7, clientX: 0, clientY: 0 })
    expect(target.hasPointerCapture(7)).toBe(false)
  })

  it('ignores non-primary buttons', () => {
    const onMove = vi.fn()
    render(<Harness onMove={onMove} />)
    const target = screen.getByTestId('target')

    fireEvent.pointerDown(target, { pointerId: 1, button: 2, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 50, clientY: 50 })
    flushRaf()

    expect(onMove).not.toHaveBeenCalled()
  })

  it('does not start a gesture when canStart returns false', () => {
    const onEnd = vi.fn()
    function Gated() {
      const handlers = usePointerDrag<void>({ canStart: () => false, onEnd })
      return (
        <div data-testid="target" {...handlers}>
          gated
        </div>
      )
    }
    render(<Gated />)
    const target = screen.getByTestId('target')
    fireEvent.pointerDown(target, { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(target, { pointerId: 1, clientX: 10, clientY: 10 })
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('does not emit moves after the gesture ends', () => {
    const onMove = vi.fn()
    render(<Harness onMove={onMove} />)
    const target = screen.getByTestId('target')

    fireEvent.pointerDown(target, { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerUp(target, { pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 99, clientY: 99 })
    flushRaf()

    expect(onMove).not.toHaveBeenCalled()
  })
})
