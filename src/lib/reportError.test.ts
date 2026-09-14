import { afterEach, describe, expect, it, vi } from 'vitest'
import { reportError } from './reportError'

describe('reportError', () => {
  afterEach(() => vi.restoreAllMocks())

  it('logs the error with its source in development', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const err = new Error('boom')
    reportError(err, { source: 'test.site' })
    // import.meta.env.DEV is true under Vitest.
    expect(spy).toHaveBeenCalledWith(
      '[test.site]',
      err,
      expect.objectContaining({ source: 'test.site' }),
    )
  })
})
