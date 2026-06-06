import { useState } from 'react'
import type { Station } from '../types'
import { StationCard } from './StationCard'

type Tab = 'all' | 'favorites' | 'popular'

interface StationGridProps {
  stations: Station[]
  loading: boolean
  search: string
  activeSlug: string | null
  isPlaying: boolean
  favorites: string[]
  hidden: string[]
  darkMode: boolean
  onPlay: (station: Station) => void
  onToggleFavorite: (slug: string) => void
  onToggleHide: (slug: string) => void
}

export function StationGrid({
  stations,
  search,
  activeSlug,
  isPlaying,
  favorites,
  hidden,
  darkMode,
  onPlay,
  onToggleFavorite,
  onToggleHide,
}: StationGridProps) {
  const [tab, setTab] = useState<Tab>('all')
  const [showHidden, setShowHidden] = useState(false)

  const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

  const filtered = stations.filter((s) => {
    if (!showHidden && hidden.includes(s.slug)) return false
    if (search) {
      const name = s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      if (!name.includes(normalizedSearch)) return false
    }
    if (tab === 'favorites') return favorites.includes(s.slug)
    if (tab === 'popular') return s.popular === 'true'
    return true
  })

  const hiddenCount = stations.filter((s) => hidden.includes(s.slug)).length

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'הכל' },
    { id: 'favorites', label: `מועדפים${favorites.length ? ` (${favorites.length})` : ''}` },
    { id: 'popular', label: 'פופולרי' },
  ]

  return (
    <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
      {/* Tabs */}
      <div className={`flex gap-1 mb-5 border-b pb-0 ${darkMode ? 'border-white/8' : 'border-gray-200'}`}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative
              ${tab === t.id
                ? 'text-[#e8192c]'
                : darkMode ? 'text-white/50 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'
              }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e8192c] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={`text-center py-20 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
          <div className="text-4xl mb-3">📻</div>
          <p className="text-sm">לא נמצאו תחנות</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((station) => (
            <StationCard
              key={station.slug}
              station={station}
              isActive={activeSlug === station.slug}
              isPlaying={isPlaying && activeSlug === station.slug}
              isFavorite={favorites.includes(station.slug)}
              isHidden={hidden.includes(station.slug)}
              darkMode={darkMode}
              onPlay={() => onPlay(station)}
              onToggleFavorite={() => onToggleFavorite(station.slug)}
              onToggleHide={() => onToggleHide(station.slug)}
            />
          ))}
        </div>
      )}

      {/* Hidden stations toggle */}
      {hiddenCount > 0 && !search && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              darkMode
                ? 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
                : 'border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400'
            }`}
          >
            {showHidden ? 'הסתר תחנות מוסתרות' : `הצג תחנות מוסתרות (${hiddenCount})`}
          </button>
        </div>
      )}
    </div>
  )
}
