import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStations } from './useStations'

const mockStations = [
  { name: 'Radio 1', audio: 'http://stream1', slug: 'radio-1', logo: 'logo1.png' },
  { name: 'Radio 2', audio: 'http://stream2', slug: 'radio-2', logo: 'logo2.png' },
  { name: 'No Audio', slug: 'no-audio', logo: 'logo3.png' },
  { name: 'No Slug', audio: 'http://stream4', logo: 'logo4.png' },
]

describe('useStations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts in loading state with empty stations', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) // never resolves
    const { result } = renderHook(() => useStations())
    expect(result.current.loading).toBe(true)
    expect(result.current.stations).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('loads and filters stations that have both slug and audio', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ stations: mockStations }),
    } as unknown as Response)

    const { result } = renderHook(() => useStations())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.stations).toHaveLength(2)
    expect(result.current.stations[0].slug).toBe('radio-1')
    expect(result.current.stations[1].slug).toBe('radio-2')
    expect(result.current.error).toBeNull()
  })

  it('handles missing stations array in response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({}),
    } as unknown as Response)

    const { result } = renderHook(() => useStations())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.stations).toEqual([])
  })

  it('sets error state on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useStations())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('לא ניתן לטעון את רשימת התחנות')
    expect(result.current.stations).toEqual([])
  })

  it('ignores AbortError and keeps loading state', async () => {
    const abortError = new DOMException('Aborted', 'AbortError')
    global.fetch = vi.fn().mockRejectedValue(abortError)

    const { result } = renderHook(() => useStations())

    // Wait a tick for the promise to settle
    await new Promise((r) => setTimeout(r, 0))

    expect(result.current.error).toBeNull()
    expect(result.current.stations).toEqual([])
  })
})
