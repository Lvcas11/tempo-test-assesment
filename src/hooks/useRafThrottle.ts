import { useCallback, useEffect, useRef } from 'react'

/**
 * Coalesce rapid calls into at most one per animation frame. The latest
 * arguments win; the wrapped callback runs inside `requestAnimationFrame`, which
 * is exactly the cadence we want for pointer-driven DOM updates. A pending frame
 * is cancelled on unmount.
 */
export function useRafThrottle<Args extends readonly unknown[]>(
  callback: (...args: Args) => void,
): (...args: Args) => void {
  const callbackRef = useRef(callback)
  const frameRef = useRef<number | null>(null)
  const argsRef = useRef<Args | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return useCallback((...args: Args) => {
    argsRef.current = args
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      if (argsRef.current) callbackRef.current(...argsRef.current)
    })
  }, [])
}
