import { useCallback, useState } from 'react'
import { Header } from './components/Header'
import { StationGrid } from './components/StationGrid'
import { PlayerBar } from './components/PlayerBar'
import { useStations } from './hooks/useStations'
import { usePlayer } from './hooks/usePlayer'
import { useNowPlaying } from './hooks/useNowPlaying'
import { useSliderLabels } from './hooks/useSliderLabels'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Slider, Station } from './types'

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage('100fm_dark_mode', true)
  const [favorites, setFavorites] = useLocalStorage<string[]>('100fm_favorites', [])
  const [hidden, setHidden] = useLocalStorage<string[]>('100fm_hidden', [])
  const [volume, setVolumeStorage] = useLocalStorage('100fm_volume', 0.8)
  const [search, setSearch] = useState('')

  const { stations, loading } = useStations()
  const player = usePlayer(volume)

  const activeInfoUrl = player.currentSlider?.info ?? player.currentStation?.info
  const nowPlaying = useNowPlaying(activeInfoUrl)
  const sliderLabels = useSliderLabels(player.currentStation?.sliders, player.currentStation?.name ?? '')

  const handleVolumeChange = useCallback((v: number) => {
    player.setVolume(v)
    setVolumeStorage(v)
  }, [player, setVolumeStorage])

  const handlePlay = useCallback((station: Station) => {
    if (player.currentStation?.slug === station.slug && !player.currentSlider) {
      if (player.isPlaying) player.pause()
      else player.resume()
    } else {
      player.play(station)
    }
  }, [player])

  const handlePlayPause = useCallback(() => {
    if (player.isPlaying) player.pause()
    else player.resume()
  }, [player])

  const handleSelectSlider = useCallback((slider: Slider) => {
    if (player.currentStation) player.playSlider(slider, player.currentStation)
  }, [player])

  const handleSelectLive = useCallback(() => {
    if (player.currentStation) player.playLive(player.currentStation)
  }, [player])

  const handleToggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }, [setFavorites])

  const handleToggleHide = useCallback((slug: string) => {
    setHidden((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
    if (player.currentStation?.slug === slug) player.stop()
  }, [setHidden, player])

  const handleDarkModeToggle = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [setDarkMode])

  if (darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }


  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header
        search={search}
        onSearchChange={setSearch}
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
      />

      <main className={`flex-1 flex flex-col ${player.currentStation ? 'pb-[140px]' : ''}`}>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#e8192c] animate-spin" />
            <p className="text-white/40 text-sm">טוען תחנות...</p>
          </div>
        ) : (
          <StationGrid
            stations={stations}
            loading={false}
            search={search}
            activeSlug={player.currentStation?.slug ?? null}
            isPlaying={player.isPlaying}
            favorites={favorites}
            hidden={hidden}
            onPlay={handlePlay}
            onToggleFavorite={handleToggleFavorite}
            onToggleHide={handleToggleHide}
          />
        )}
      </main>

      {player.currentStation && (
        <PlayerBar
          station={player.currentStation}
          currentSlider={player.currentSlider}
          nowPlaying={nowPlaying}
          isPlaying={player.isPlaying}
          isLoading={player.isLoading}
          volume={player.volume}
          isFavorite={favorites.includes(player.currentStation.slug)}
          onPlayPause={handlePlayPause}
          onStop={player.stop}
          onVolumeChange={handleVolumeChange}
          onToggleFavorite={() => handleToggleFavorite(player.currentStation!.slug)}
          sliderLabels={sliderLabels}
          onSelectLive={handleSelectLive}
          onSelectSlider={handleSelectSlider}
        />
      )}
    </div>
  )
}
