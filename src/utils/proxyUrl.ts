export async function fetchNowPlayingJson(url: string): Promise<{ artist?: string; name?: string } | null> {
  try {
    const res = await fetch(url)
    const text = await res.text()
    if (!text.trimStart().startsWith('{')) return null
    return JSON.parse(text) as { artist?: string; name?: string }
  } catch {
    return null
  }
}
