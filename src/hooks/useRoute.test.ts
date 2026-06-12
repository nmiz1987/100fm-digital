import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRoute } from './useRoute'

describe('useRoute', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('returns the current pathname', () => {
    window.history.replaceState(null, '', '/car')
    const { result } = renderHook(() => useRoute())
    expect(result.current.pathname).toBe('/car')
  })

  it('navigate pushes a new history entry and updates pathname', () => {
    const { result } = renderHook(() => useRoute())

    act(() => {
      result.current.navigate('/car')
    })

    expect(result.current.pathname).toBe('/car')
    expect(window.location.pathname).toBe('/car')
  })

  it('navigate is a no-op when navigating to the current path', () => {
    const { result } = renderHook(() => useRoute())
    const historyLength = window.history.length

    act(() => {
      result.current.navigate('/')
    })

    expect(window.history.length).toBe(historyLength)
  })

  it('updates pathname on popstate', () => {
    const { result } = renderHook(() => useRoute())

    act(() => {
      window.history.pushState(null, '', '/car/some-station')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(result.current.pathname).toBe('/car/some-station')
  })
})
