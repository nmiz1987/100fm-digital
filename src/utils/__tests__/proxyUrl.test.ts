import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchNowPlayingJson } from '../proxyUrl';

describe('fetchNowPlayingJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('{"artist":"The Beatles","name":"Hey Jude"}'),
    } as unknown as Response);

    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1');
    expect(result).toEqual({ artist: 'The Beatles', name: 'Hey Jude' });
  });

  it('returns parsed data on XML <track> response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () =>
        Promise.resolve('<track><artist>50 cent</artist><name>Candy shop</name><timestamp>1780838260</timestamp><before>1780838355</before></track>'),
    } as unknown as Response);

    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1');
    expect(result).toEqual({
      artist: '50 cent',
      name: 'Candy shop',
      timestamp: 1780838260,
      before: 1780838355,
    });
  });

  it('returns null when response is neither JSON nor XML', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('not a track'),
    } as unknown as Response);

    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1');
    expect(result).toBeNull();
  });

  it('returns null when XML has no <track> element', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('<xml>not a track</xml>'),
    } as unknown as Response);

    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1');
    expect(result).toBeNull();
  });

  it('returns null on fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await fetchNowPlayingJson('https://digital.100fm.co.il/api/nowplaying/s/1');
    expect(result).toBeNull();
  });

  it('fetches the URL directly without rewriting', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('{"artist":"A","name":"B"}'),
    } as unknown as Response);
    global.fetch = mockFetch;

    const url = 'https://digital.100fm.co.il/api/nowplaying/s/1';
    await fetchNowPlayingJson(url);
    expect(mockFetch).toHaveBeenCalledWith(url);
  });
});
