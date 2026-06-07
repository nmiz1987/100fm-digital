import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLoadingTimeoutWarning } from './useLoadingTimeoutWarning'

describe('useLoadingTimeoutWarning', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stays hidden while not loading', () => {
    const { result } = renderHook(() => useLoadingTimeoutWarning(false))
    act(() => { vi.advanceTimersByTime(20_000) })
    expect(result.current.visible).toBe(false)
  })

  it('stays hidden if loading resolves before 10 seconds', () => {
    const { result, rerender } = renderHook(({ loading }) => useLoadingTimeoutWarning(loading), {
      initialProps: { loading: true },
    })

    act(() => { vi.advanceTimersByTime(9_000) })
    rerender({ loading: false })
    act(() => { vi.advanceTimersByTime(5_000) })

    expect(result.current.visible).toBe(false)
  })

  it('becomes visible after loading for 10 seconds', () => {
    const { result } = renderHook(() => useLoadingTimeoutWarning(true))

    act(() => { vi.advanceTimersByTime(9_999) })
    expect(result.current.visible).toBe(false)

    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current.visible).toBe(true)
  })

  it('hides itself automatically 3 seconds after appearing', () => {
    const { result } = renderHook(() => useLoadingTimeoutWarning(true))

    act(() => { vi.advanceTimersByTime(10_000) })
    expect(result.current.visible).toBe(true)

    act(() => { vi.advanceTimersByTime(2_999) })
    expect(result.current.visible).toBe(true)

    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current.visible).toBe(false)
  })

  it('can be dismissed manually before the auto-hide timer fires', () => {
    const { result } = renderHook(() => useLoadingTimeoutWarning(true))

    act(() => { vi.advanceTimersByTime(10_000) })
    expect(result.current.visible).toBe(true)

    act(() => { result.current.dismiss() })
    expect(result.current.visible).toBe(false)
  })
})
