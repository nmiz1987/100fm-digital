import { useState, useEffect } from 'react'
import type { NowPlaying } from '../types'
import { fetchNowPlayingJson } from '../utils/proxyUrl'

const POLL_INTERVAL = 30_000

export function useNowPlaying(infoUrl: string | undefined) {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)

  useEffect(() => {
    if (!infoUrl) {
      setNowPlaying(null)
      return
    }

    let cancelled = false

    async function fetch() {
      if (!infoUrl) return
      const data = await fetchNowPlayingJson(infoUrl)
      if (!cancelled && data) setNowPlaying(data as NowPlaying)
    }

    void fetch()
    const id = setInterval(() => void fetch(), POLL_INTERVAL)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [infoUrl])

  return nowPlaying
}
