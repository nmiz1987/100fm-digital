import type { Station, Slider, NowPlaying } from '../../types';
import { PauseIcon, PlayIcon } from '../common/icons';
import { VolumeSlider } from './VolumeSlider/VolumeSlider';
import { SliderTabs } from './SliderTabs/SliderTabs';
import { usePlayerBar } from './usePlayerBar';

interface PlayerBarProps {
  station: Station;
  currentSlider: Slider | null;
  sliderLabels: string[];
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isFavorite: boolean;
  darkMode: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onVolumeChange: (v: number) => void;
  onToggleFavorite: () => void;
  onSelectLive: () => void;
  onSelectSlider: (slider: Slider) => void;
}

export function PlayerBar({
  station,
  currentSlider,
  sliderLabels,
  nowPlaying,
  isPlaying,
  isLoading,
  volume,
  isFavorite,
  darkMode,
  onPlayPause,
  onStop,
  onVolumeChange,
  onToggleFavorite,
  onSelectLive,
  onSelectSlider,
}: PlayerBarProps) {
  const { hasSliders, trackLine, currentSliderIndex } = usePlayerBar({ station, currentSlider, nowPlaying });

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur border-t flex flex-col ${hasSliders ? 'pb-1' : ''} ${darkMode ? 'bg-[#111111]/98 border-white/8' : 'bg-white/98 border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.08)]'}`}
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
            <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{station.name}</p>
            {isLoading ? (
              <p className={`text-xs animate-pulse ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>טוען...</p>
            ) : trackLine ? (
              <p className={`text-xs truncate ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{trackLine}</p>
            ) : (
              <p className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {currentSlider
                  ? (sliderLabels[currentSliderIndex] ?? 'שידור מושהה')
                  : hasSliders
                    ? `${station.name} #1`
                    : 'שידור חי'}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors text-lg leading-none
              ${isFavorite ? 'text-[#e8192c]' : darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>

          <button
            onClick={onPlayPause}
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
            onClick={onStop}
            className={`p-2 transition-colors text-sm rounded-full ${darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            title="עצור"
          >
            ✕
          </button>
        </div>

        <VolumeSlider volume={volume} darkMode={darkMode} onChange={onVolumeChange} />
      </div>

      {hasSliders && (
        <SliderTabs
          station={station}
          currentSlider={currentSlider}
          sliderLabels={sliderLabels}
          darkMode={darkMode}
          onSelectLive={onSelectLive}
          onSelectSlider={onSelectSlider}
        />
      )}
    </div>
  );
}
