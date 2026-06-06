import { useState, useEffect } from 'react'
import type { Slider } from '../types'
import { fetchNowPlayingJson } from '../utils/proxyUrl'

const POLL_INTERVAL = 30_000

function buildLabel(data: { artist?: string; name?: string } | null, fallback: string): string {
  const artist = data?.artist?.trim()
  const name = data?.name?.trim()
  if (artist && name) return `${artist} — ${name}`
  if (artist) return artist
  if (name) return name
  return fallback
}

export function useSliderLabels(sliders: Slider[] | undefined, stationName: string): string[] {
  const [labels, setLabels] = useState<string[]>([])

  // Stable key so the effect only re-runs when the slider set actually changes
  const infoKey = sliders?.map((s) => s.info ?? '').join('|') ?? ''

  useEffect(() => {
    if (!sliders || sliders.length === 0) return

    let cancelled = false

    async function refresh() {
      if (!sliders) return
      const results = await Promise.all(
        sliders.map((slider, i) =>
          slider.info
            ? fetchNowPlayingJson(slider.info).then((data) =>
                buildLabel(data, `${stationName} #${i + 1}`)
              )
            : Promise.resolve(`${stationName} #${i + 1}`)
        )
      )
      if (!cancelled) setLabels(results)
    }

    void refresh()
    const id = setInterval(() => void refresh(), POLL_INTERVAL)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoKey, stationName])

  return sliders && sliders.length > 0 ? labels : []
}
