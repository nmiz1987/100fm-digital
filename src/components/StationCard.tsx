import { useState } from 'react';

const BAR_STYLES = [1, 2, 3, 4].map((i) => ({
  height: `${20 + Math.random() * 60}%`,
  animationDelay: `${i * 0.1}s`,
  animationDuration: `${0.6 + Math.random() * 0.4}s`,
}));
import type { Station } from '../types';

interface StationCardProps {
  station: Station;
  isPlaying: boolean;
  isActive: boolean;
  isFavorite: boolean;
  isHidden: boolean;
  darkMode: boolean;
  viewMode?: 'grid' | 'list';
  onPlay: () => void;
  onToggleFavorite: () => void;
  onToggleHide: () => void;
}

export function StationCard({
  station,
  isPlaying,
  isActive,
  isFavorite,
  isHidden,
  darkMode,
  viewMode = 'grid',
  onPlay,
  onToggleFavorite,
  onToggleHide,
}: StationCardProps) {
  const [imgSrc, setImgSrc] = useState(station.cover ?? station.logo);

  if (viewMode === 'list') {
    return (
      <div
        className={`
          relative flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200
          ${isHidden ? 'opacity-40' : ''}
          ${darkMode ? 'bg-[#1a1a1a] hover:bg-[#242424]' : 'bg-white hover:bg-gray-50 border-b border-gray-100'}
          ${isActive ? 'border-r-4 border-r-[#e8192c]' : ''}
        `}
        onClick={onPlay}
      >
        {/* Thumbnail */}
        <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden">
          <img src={imgSrc} alt={station.name} className="w-full h-full object-cover" onError={() => setImgSrc(station.cover ?? station.logo)} />
          {isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {isPlaying ? (
                <div className="flex gap-0.5 items-end h-4">
                  {BAR_STYLES.map((style, idx) => (
                    <div key={idx} className="w-0.5 bg-[#e8192c] rounded-full animate-pulse" style={style} />
                  ))}
                </div>
              ) : (
                <span className="text-white text-xs">▶</span>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{station.name}</p>
          {station.description && (
            <p className={`text-xs truncate ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{station.description.split('\n')[0]}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!isHidden && (
            <button
              onClick={onToggleFavorite}
              className={`text-xl leading-none transition-colors ${isFavorite ? 'text-[#e8192c]' : darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
              title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          )}
          <button
            onClick={onToggleHide}
            className={`transition-colors ${isHidden ? 'text-[#e8192c]' : darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            title={isHidden ? 'הצג תחנה' : 'הסתר תחנה'}
          >
            {isHidden ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        ${isHidden ? 'opacity-40' : ''}
        ${darkMode ? 'bg-[#1a1a1a] hover:bg-[#242424]' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}
        ${isActive ? 'ring-2 ring-[#e8192c] shadow-lg shadow-[#e8192c]/20' : darkMode ? 'hover:ring-1 hover:ring-white/10' : 'hover:ring-1 hover:ring-gray-300'}
      `}
      onClick={onPlay}
    >
      {/* Cover image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imgSrc}
          alt={station.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(station.cover ?? station.logo)}
        />

        {/* Playing overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {isPlaying ? (
              <div className="flex gap-0.5 items-end h-6">
                {BAR_STYLES.map((style, idx) => (
                  <div key={idx} className="w-1 bg-[#e8192c] rounded-full animate-pulse" style={style} />
                ))}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#e8192c] flex items-center justify-center">
                <span className="text-white text-lg mr-0.5">▶</span>
              </div>
            )}
          </div>
        )}

        {/* Hover play button — desktop only */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-[#e8192c] flex items-center justify-center shadow-lg">
              <span className="text-white text-lg mr-0.5">▶</span>
            </div>
          </div>
        )}

        {/* Popular badge */}
        {station.popular === 'true' && (
          <div className="absolute top-2 right-2 bg-[#e8192c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">פופולרי</div>
        )}
      </div>

      {/* Action row */}
      <div
        className={`flex items-center gap-3 px-3 pt-2 ${darkMode ? 'border-t border-white/5' : 'border-t border-gray-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isHidden && (
          <button
            onClick={onToggleFavorite}
            className={`text-xl leading-none transition-colors ${isFavorite ? 'text-[#e8192c]' : darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
        <button
          onClick={onToggleHide}
          className={`transition-colors ${isHidden ? 'text-[#e8192c]' : darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
          title={isHidden ? 'הצג תחנה' : 'הסתר תחנה'}
        >
          {isHidden ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="px-3 pt-1.5 pb-3">
        <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{station.name}</p>
        {station.description && (
          <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            {station.description.split('\n')[0]}
          </p>
        )}
      </div>
    </div>
  );
}
