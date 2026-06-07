import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

function mockMatchMedia(initialMatches: boolean) {
  let listener: (() => void) | null = null
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: vi.fn((_event: string, cb: () => void) => {
      listener = cb
    }),
    removeEventListener: vi.fn(),
  }
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue(mql),
  })
  return {
    mql,
    fireChange: (matches: boolean) => {
      mql.matches = matches
      listener?.()
    },
  }
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the initial matches value from matchMedia', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(max-width: 1023px)'))
    expect(result.current).toBe(true)
  })

  it('updates when the media query change event fires', () => {
    const { fireChange } = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 1023px)'))

    expect(result.current).toBe(false)
    act(() => fireChange(true))
    expect(result.current).toBe(true)
  })

  it('removes the event listener on unmount', () => {
    const { mql } = mockMatchMedia(true)
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 1023px)'))

    const handler = mql.addEventListener.mock.calls[0][1]
    unmount()

    expect(mql.removeEventListener).toHaveBeenCalledWith('change', handler)
  })
})
