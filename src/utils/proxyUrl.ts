export function proxyInfoUrl(url: string): string {
  if (url.includes('digital.100fm.co.il/api/')) {
    return url.replace('https://digital.100fm.co.il', '/nowplaying-proxy')
  }
  return url
}

export async function fetchNowPlayingJson(url: string): Promise<{ artist?: string; name?: string } | null> {
  try {
    const res = await fetch(proxyInfoUrl(url))
    const text = await res.text()
    if (!text.trimStart().startsWith('{')) return null
    return JSON.parse(text) as { artist?: string; name?: string }
  } catch {
    return null
  }
}
