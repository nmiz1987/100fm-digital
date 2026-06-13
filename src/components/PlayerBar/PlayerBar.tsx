import { forwardRef } from 'react';
import { PauseIcon, PlayIcon } from '../common/icons';
import { VolumeSlider } from '../VolumeSlider/VolumeSlider';
import { SliderTabs } from '../SliderTabs/SliderTabs';
import { usePlayerBar } from './usePlayerBar';
import { useStore } from '../../store/store';

export const PlayerBar = forwardRef<HTMLDivElement, object>(function PlayerBar(_props, ref) {
  const station = useStore((state) => state.currentStation);
  const currentSlider = useStore((state) => state.currentSlider);
  const sliderLabels = useStore((state) => state.sliderLabels);
  const nowPlaying = useStore((state) => state.nowPlaying);
  const isPlaying = useStore((state) => state.isPlaying);
  const isLoading = useStore((state) => state.isLoading);
  const favorites = useStore((state) => state.favorites);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const handlePlayPause = useStore((state) => state.handlePlayPause);
  const stop = useStore((state) => state.stop);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const { hasSliders, trackLine, currentSliderIndex } = usePlayerBar({ station, currentSlider, nowPlaying });

  if (!station) return null;

  const isFavorite = favorites.includes(station.slug);

  return (
    <div
      ref={ref}
      className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur border-t flex flex-col ${hasSliders ? 'pb-1' : ''} ${isDarkMode ? 'bg-[#111111]/98 border-white/8' : 'bg-white/98 border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.08)]'}`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-2 h-17.5 md:h-18">
        {/* Station info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={station.cover ?? station.logo}
            alt={station.name}
            className="h-10 w-10 rounded object-cover shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = station.logo;
            }}
          />
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{station.name}</p>
            {isLoading ? (
              <p className={`text-sm animate-pulse ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>טוען...</p>
            ) : trackLine ? (
              <p className={`text-sm truncate ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{trackLine}</p>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {currentSlider
                  ? (sliderLabels[currentSliderIndex + 1] ?? 'שידור מושהה')
                  : hasSliders
                    ? (sliderLabels[0] ?? `${station.name} #1`)
                    : 'שידור חי'}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleFavorite(station.slug)}
            className={`p-2 rounded-full transition-colors text-lg leading-none
              ${isFavorite ? 'text-[#e8192c]' : isDarkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>

          <button
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all
              ${isLoading ? 'bg-[#e8192c]/40 cursor-wait' : 'bg-[#e8192c] hover:bg-[#c8141f] active:scale-95'}`}
            title={isPlaying ? 'השהה' : 'נגן'}
          >
            {isLoading ? (
              <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </button>

          <button
            onClick={stop}
            className={`p-2 transition-colors text-sm rounded-full ${isDarkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            title="עצור"
          >
            ✕
          </button>
        </div>

        <VolumeSlider />
      </div>

      {hasSliders && <SliderTabs station={station} />}
    </div>
  );
});
