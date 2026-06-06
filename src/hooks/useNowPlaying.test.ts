import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useNowPlaying } from './useNowPlaying'

vi.mock('../utils/proxyUrl', () => ({
  fetchNowPlayingJson: vi.fn(),
}))

import { fetchNowPlayingJson } from '../utils/proxyUrl'
const mockFetch = fetchNowPlayingJson as ReturnType<typeof vi.fn>

describe('useNowPlaying', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when no infoUrl provided', () => {
    const { result } = renderHook(() => useNowPlaying(undefined))
    expect(result.current).toBeNull()
  })

  it('fetches and returns now-playing data', async () => {
    mockFetch.mockResolvedValue({ artist: 'Radiohead', name: 'Creep' })

    const { result } = renderHook(() =>
      useNowPlaying('https://digital.100fm.co.il/api/nowplaying/s/1')
    )

    await waitFor(() => expect(result.current).not.toBeNull())
    expect(result.current?.artist).toBe('Radiohead')
    expect(result.current?.name).toBe('Creep')
  })

  it('resets to null when infoUrl changes to undefined', async () => {
    mockFetch.mockResolvedValue({ artist: 'Artist', name: 'Track' })

    const { result, rerender } = renderHook(
      ({ url }: { url: string | undefined }) => useNowPlaying(url),
      { initialProps: { url: 'https://digital.100fm.co.il/api/nowplaying/s/1' as string | undefined } }
    )

    await waitFor(() => expect(result.current).not.toBeNull())

    rerender({ url: undefined })
    expect(result.current).toBeNull()
  })

  it('polls every 30 seconds', async () => {
    vi.useFakeTimers()
    mockFetch.mockResolvedValue({ artist: 'A', name: 'B' })

    renderHook(() => useNowPlaying('https://digital.100fm.co.il/api/nowplaying/s/1'))

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
