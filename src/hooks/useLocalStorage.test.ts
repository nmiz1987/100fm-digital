import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the initial value when key is not in storage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42))
    expect(result.current[0]).toBe(42)
  })

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify(99))
    const { result } = renderHook(() => useLocalStorage('test-key', 0))
    expect(result.current[0]).toBe(99)
  })

  it('persists updates to localStorage', async () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'hello'))

    await act(async () => {
      result.current[1]('world')
    })

    expect(result.current[0]).toBe('world')
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('world')
  })

  it('works with array values', async () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('arr-key', []))

    await act(async () => {
      result.current[1](['a', 'b'])
    })

    expect(result.current[0]).toEqual(['a', 'b'])
  })

  it('returns initial value when localStorage contains invalid JSON', () => {
    localStorage.setItem('bad-key', 'not valid json {{{')
    const { result } = renderHook(() => useLocalStorage('bad-key', 'default'))
    expect(result.current[0]).toBe('default')
  })
})
