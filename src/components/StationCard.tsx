import { useState } from 'react'

const BAR_STYLES = [1, 2, 3, 4].map((i) => ({
  height: `${20 + Math.random() * 60}%`,
  animationDelay: `${i * 0.1}s`,
  animationDuration: `${0.6 + Math.random() * 0.4}s`,
}))
import type { Station } from '../types'

interface StationCardProps {
  station: Station
  isPlaying: boolean
  isActive: boolean
  isFavorite: boolean
  isHidden: boolean
  darkMode: boolean
  onPlay: () => void
  onToggleFavorite: () => void
  onToggleHide: () => void
}

export function StationCard({
  station,
  isPlaying,
  isActive,
  isFavorite,
  isHidden,
  darkMode,
  onPlay,
  onToggleFavorite,
  onToggleHide,
}: StationCardProps) {
  const [imgSrc, setImgSrc] = useState(station.cover ?? station.logo)
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={`
        relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        ${isHidden ? 'opacity-40' : ''}
        ${darkMode ? 'bg-[#1a1a1a] hover:bg-[#242424]' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}
        ${isActive ? 'ring-2 ring-[#e8192c] shadow-lg shadow-[#e8192c]/20' : darkMode ? 'hover:ring-1 hover:ring-white/10' : 'hover:ring-1 hover:ring-gray-300'}
      `}
      onClick={onPlay}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Cover image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imgSrc}
          alt={station.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(station.logo)}
        />

        {/* Playing overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {isPlaying ? (
              <div className="flex gap-0.5 items-end h-6">
                {BAR_STYLES.map((style, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-[#e8192c] rounded-full animate-pulse"
                    style={style}
                  />
                ))}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#e8192c] flex items-center justify-center">
                <span className="text-white text-lg mr-0.5">▶</span>
              </div>
            )}
          </div>
        )}

        {/* Hover play button */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-[#e8192c] flex items-center justify-center shadow-lg">
              <span className="text-white text-lg mr-0.5">▶</span>
            </div>
          </div>
        )}

        {/* Popular badge */}
        {station.popular === 'true' && (
          <div className="absolute top-2 right-2 bg-[#e8192c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            פופולרי
          </div>
        )}

        {/* Action buttons */}
        <div
          className={`absolute top-2 left-2 flex gap-1 transition-opacity duration-150 ${showActions || isFavorite || isHidden ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {!isHidden && (
            <button
              onClick={onToggleFavorite}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors
                ${isFavorite ? 'bg-[#e8192c] text-white' : 'bg-black/60 text-white/70 hover:text-white'}`}
              title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          )}
          <button
            onClick={onToggleHide}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${isHidden ? 'bg-[#e8192c] text-white' : 'bg-black/60 text-white/70 hover:text-white'}`}
            title={isHidden ? 'הצג תחנה' : 'הסתר תחנה'}
          >
            {isHidden ? '🚫' : '👁'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{station.name}</p>
        {station.description && (
          <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            {station.description.split('\n')[0]}
          </p>
        )}
      </div>
    </div>
  )
}
