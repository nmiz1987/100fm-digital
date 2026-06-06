import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSliderLabels } from './useSliderLabels'
import type { Slider } from '../types'

vi.mock('../utils/proxyUrl', () => ({
  fetchNowPlayingJson: vi.fn(),
}))

import { fetchNowPlayingJson } from '../utils/proxyUrl'
const mockFetch = fetchNowPlayingJson as ReturnType<typeof vi.fn>

describe('useSliderLabels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when sliders are undefined', () => {
    const { result } = renderHook(() => useSliderLabels(undefined, 'MyStation'))
    expect(result.current).toEqual([])
  })

  it('returns empty array when sliders array is empty', () => {
    const { result } = renderHook(() => useSliderLabels([], 'MyStation'))
    expect(result.current).toEqual([])
  })

  it('uses fallback label when slider has no info URL', async () => {
    const sliders: Slider[] = [{ audio: 'http://stream1' }, { audio: 'http://stream2' }]

    const { result } = renderHook(() => useSliderLabels(sliders, 'MyStation'))

    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current[0]).toBe('MyStation #2')
    expect(result.current[1]).toBe('MyStation #3')
  })

  it('builds label as "artist — name" when both are present', async () => {
    mockFetch.mockResolvedValue({ artist: 'Pink Floyd', name: 'Comfortably Numb' })

    const sliders: Slider[] = [
      { audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' },
    ]
    const { result } = renderHook(() => useSliderLabels(sliders, 'MyStation'))

    await waitFor(() => expect(result.current[0]).toBe('Pink Floyd — Comfortably Numb'))
  })

  it('uses only artist when name is missing', async () => {
    mockFetch.mockResolvedValue({ artist: 'Pink Floyd', name: '' })

    const sliders: Slider[] = [
      { audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' },
    ]
    const { result } = renderHook(() => useSliderLabels(sliders, 'MyStation'))

    await waitFor(() => expect(result.current[0]).toBe('Pink Floyd'))
  })

  it('falls back to station label when API returns empty data', async () => {
    mockFetch.mockResolvedValue({ artist: '', name: '' })

    const sliders: Slider[] = [
      { audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' },
    ]
    const { result } = renderHook(() => useSliderLabels(sliders, 'MyStation'))

    await waitFor(() => expect(result.current[0]).toBe('MyStation #2'))
  })

  it('polls every 30 seconds', async () => {
    vi.useFakeTimers()
    mockFetch.mockResolvedValue({ artist: 'A', name: 'B' })

    const sliders: Slider[] = [
      { audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' },
    ]
    renderHook(() => useSliderLabels(sliders, 'Station'))

    // Flush the initial async fetch
    await act(async () => {
      await Promise.resolve()
    })
    const callsAfterMount = mockFetch.mock.calls.length
    expect(callsAfterMount).toBeGreaterThanOrEqual(1)

    await act(async () => {
      vi.advanceTimersByTime(30_000)
      await Promise.resolve()
    })

    expect(mockFetch.mock.calls.length).toBeGreaterThan(callsAfterMount)
    vi.useRealTimers()
  })
})
