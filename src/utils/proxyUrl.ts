interface NowPlayingData {
  artist?: string;
  name?: string;
  timestamp?: number;
  before?: number;
}

function parseNowPlayingXml(xml: string): NowPlayingData | null {
  const track = new DOMParser().parseFromString(xml, 'application/xml').querySelector('track');
  if (!track) return null;

  const text = (tag: string) => track.querySelector(tag)?.textContent?.trim() || undefined;
  const number = (tag: string) => {
    const value = text(tag);
    return value ? Number(value) : undefined;
  };

  return {
    artist: text('artist'),
    name: text('name'),
    timestamp: number('timestamp'),
    before: number('before'),
  };
}

export async function fetchNowPlayingJson(url: string): Promise<NowPlayingData | null> {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const trimmed = text.trimStart();

    if (trimmed.startsWith('{')) return JSON.parse(trimmed) as NowPlayingData;
    if (trimmed.startsWith('<')) return parseNowPlayingXml(trimmed);
    return null;
  } catch {
    return null;
  }
}
