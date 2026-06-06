import { describe, it, expect, vi, beforeEach } from 'vitest'
import { proxyInfoUrl, fetchNowPlayingJson } from './proxyUrl'

describe('proxyInfoUrl', () => {
  it('rewrites 100fm API URLs to use the nowplaying proxy', () => {
    expect(proxyInfoUrl('https://digital.100fm.co.il/api/nowplaying/station/1')).toBe(
      '/nowplaying-proxy/api/nowplaying/station/1'
    )
  })

  it('leaves non-100fm URLs unchanged', () => {
    expect(proxyInfoUrl('https://other.example.com/api/nowplaying')).toBe(
      'https://other.example.com/api/nowplaying'
    )
  })

  it('leaves relative URLs unchanged', () => {
    expect(proxyInfoUrl('/some/local/path')).toBe('/some/local/path')
  })
})

describe('fetchNowPlayingJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns parsed JSON on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('{"artist":"The Beatles","name":"Hey Jude"}'),
    } as unknown as Response)

    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1')
    expect(result).toEqual({ artist: 'The Beatles', name: 'Hey Jude' })
  })

  it('returns null when response is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('<xml>not json</xml>'),
    } as unknown as Response)

    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1')
    expect(result).toBeNull()
  })

  it('returns null on fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1')
    expect(result).toBeNull()
  })

  it('uses the proxy URL when fetching', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('{"artist":"A","name":"B"}'),
    } as unknown as Response)
    global.fetch = mockFetch

    await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1')
    expect(mockFetch).toHaveBeenCalledWith('/nowplaying-proxy/api/nowplaying/s/1')
  })
})
