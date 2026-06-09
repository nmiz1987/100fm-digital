import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSliderLabels } from './useSliderLabels'
import type { Station } from '../types'

vi.mock('../utils/proxyUrl', () => ({
  fetchNowPlayingJson: vi.fn(),
}))

import { fetchNowPlayingJson } from '../utils/proxyUrl'
const mockFetch = fetchNowPlayingJson as ReturnType<typeof vi.fn>

const baseStation: Station = {
  name: 'MyStation',
  audio: 'http://live',
  slug: 'my-station',
  logo: 'logo.png',
}

describe('useSliderLabels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when station is undefined', () => {
    const { result } = renderHook(() => useSliderLabels(undefined))
    expect(result.current).toEqual([])
  })

  it('returns empty array when sliders array is empty', () => {
    const { result } = renderHook(() => useSliderLabels({ ...baseStation, sliders: [] }))
    expect(result.current).toEqual([])
  })

  it('returns fallback labels when no info URLs are present', async () => {
    const station: Station = {
      ...baseStation,
      sliders: [{ audio: 'http://stream1' }, { audio: 'http://stream2' }],
    }
    const { result } = renderHook(() => useSliderLabels(station))

    await waitFor(() => expect(result.current).toHaveLength(3))
    expect(result.current[0]).toBe('MyStation #1') // live label
    expect(result.current[1]).toBe('MyStation #2') // slider[0] label
    expect(result.current[2]).toBe('MyStation #3') // slider[1] label
  })

  it('fetches live label from station.info (index 0)', async () => {
    mockFetch.mockResolvedValue({ artist: 'Pink Floyd', name: 'Comfortably Numb' })

    const station: Station = {
      ...baseStation,
      info: 'https://digital.100fm.co.il/api/nowplaying/s/0',
      sliders: [{ audio: 'http://stream1' }],
    }
    const { result } = renderHook(() => useSliderLabels(station))

    await waitFor(() => expect(result.current[0]).toBe('Pink Floyd — Comfortably Numb'))
    expect(result.current[1]).toBe('MyStation #2') // slider has no info
  })

  it('fetches DVR slider label from slider.info (index 1+)', async () => {
    mockFetch.mockResolvedValue({ artist: 'Pink Floyd', name: 'Comfortably Numb' })

    const station: Station = {
      ...baseStation,
      sliders: [{ audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    }
    const { result } = renderHook(() => useSliderLabels(station))

    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current[0]).toBe('MyStation #1') // live, no station.info
    expect(result.current[1]).toBe('Pink Floyd — Comfortably Numb') // slider label
  })

  it('builds label as "artist — name" when both are present', async () => {
    mockFetch.mockResolvedValue({ artist: 'Pink Floyd', name: 'Comfortably Numb' })

    const station: Station = {
      ...baseStation,
      sliders: [{ audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    }
    const { result } = renderHook(() => useSliderLabels(station))

    await waitFor(() => expect(result.current[1]).toBe('Pink Floyd — Comfortably Numb'))
  })

  it('uses only artist when name is missing', async () => {
    mockFetch.mockResolvedValue({ artist: 'Pink Floyd', name: '' })

    const station: Station = {
      ...baseStation,
      sliders: [{ audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    }
    const { result } = renderHook(() => useSliderLabels(station))

    await waitFor(() => expect(result.current[1]).toBe('Pink Floyd'))
  })

  it('uses only track name when artist is missing', async () => {
    mockFetch.mockResolvedValue({ artist: '', name: 'Blue Moon' })

    const station: Station = {
      ...baseStation,
      sliders: [{ audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    }
    const { result } = renderHook(() => useSliderLabels(station))

    await waitFor(() => expect(result.current[1]).toBe('Blue Moon'))
  })

  it('falls back to station label when API returns empty data', async () => {
    mockFetch.mockResolvedValue({ artist: '', name: '' })

    const station: Station = {
      ...baseStation,
      sliders: [{ audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    }
    const { result } = renderHook(() => useSliderLabels(station))

    await waitFor(() => expect(result.current[1]).toBe('MyStation #2'))
  })

  it('polls every 30 seconds', async () => {
    vi.useFakeTimers()
    mockFetch.mockResolvedValue({ artist: 'A', name: 'B' })

    const station: Station = {
      ...baseStation,
      info: 'https://digital.100fm.co.il/api/nowplaying/s/0',
      sliders: [{ audio: 'http://stream1', info: 'https://digital.100fm.co.il/api/nowplaying/s/1' }],
    }
    renderHook(() => useSliderLabels(station))

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
