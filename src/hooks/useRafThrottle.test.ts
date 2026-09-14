import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRafThrottle } from './useRafThrottle'

describe('useRafThrottle', () => {
  let frames: (() => void)[]

  beforeEach(() => {
    frames = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(() => cb(0))
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames[id - 1] = () => undefined
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const flush = () => {
    const pending = frames
    frames = []
    pending.forEach((f) => f())
  }

  it('coalesces multiple synchronous calls into one, with the latest args', () => {
    const spy = vi.fn()
    const { result } = renderHook(() => useRafThrottle(spy))

    act(() => {
      result.current(1)
      result.current(2)
      result.current(3)
    })
    expect(spy).not.toHaveBeenCalled()

    act(() => flush())
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(3)
  })

  it('schedules a fresh frame after the previous one runs', () => {
    const spy = vi.fn()
    const { result } = renderHook(() => useRafThrottle(spy))

    act(() => result.current('a'))
    act(() => flush())
    act(() => result.current('b'))
    act(() => flush())

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(2, 'b')
  })

  it('cancels a pending frame on unmount', () => {
    const spy = vi.fn()
    const { result, unmount } = renderHook(() => useRafThrottle(spy))

    act(() => result.current('x'))
    unmount()
    act(() => flush())

    expect(spy).not.toHaveBeenCalled()
  })
})
