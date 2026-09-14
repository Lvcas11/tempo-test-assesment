import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

/**
 * jsdom does not implement the Pointer Capture API. Provide minimal, spec-shaped
 * stubs so components that call these during pointer gestures work under test.
 */
if (!Element.prototype.setPointerCapture) {
  const captured = new WeakMap<Element, Set<number>>()
  Element.prototype.setPointerCapture = function (this: Element, pointerId: number) {
    const set = captured.get(this) ?? new Set<number>()
    set.add(pointerId)
    captured.set(this, set)
  }
  Element.prototype.releasePointerCapture = function (this: Element, pointerId: number) {
    captured.get(this)?.delete(pointerId)
  }
  Element.prototype.hasPointerCapture = function (this: Element, pointerId: number) {
    return captured.get(this)?.has(pointerId) ?? false
  }
}
