import type { Station, Slider, NowPlaying } from '../types';

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
  const hasSliders = (station.sliders?.length ?? 0) > 0;
  const trackLine = nowPlaying?.artist && nowPlaying?.name ? `${nowPlaying.artist} — ${nowPlaying.name}` : nowPlaying?.name || null;

  const inactiveTab = darkMode
    ? 'bg-white/8 text-white/50 hover:text-white hover:bg-white/12'
    : 'bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200';

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
                  ? (sliderLabels[station.sliders?.indexOf(currentSlider) ?? -1] ?? 'שידור מושהה')
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="19" x2="7" y2="5" strokeWidth="5" />
                <line x1="17" y1="19" x2="17" y2="5" strokeWidth="5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="white"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
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

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 w-32">
          <span className={`select-none ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
            {volume === 0 ? (
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
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : volume < 0.5 ? (
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
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
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
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 accent-[#e8192c] cursor-pointer"
            title="ווליום"
            dir="ltr"
          />
        </div>
      </div>

      {/* Slider tabs row */}
      {hasSliders && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
          <button
            onClick={onSelectLive}
            className={`px-3 py-0.5 rounded-full text-xs font-medium transition-colors
              ${!currentSlider ? 'bg-[#e8192c] text-white' : inactiveTab}`}
          >
            {station.name} #1
          </button>
          {station.sliders!.map((slider, i) => (
            <button
              key={i}
              onClick={() => onSelectSlider(slider)}
              title={sliderLabels[i]}
              dir="ltr"
              className={`max-w-40 truncate px-3 py-0.5 rounded-full text-xs font-medium transition-colors
                ${currentSlider?.audio === slider.audio ? 'bg-[#e8192c] text-white' : inactiveTab}`}
            >
              {sliderLabels[i] ?? `${station.name} #${i + 2}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
