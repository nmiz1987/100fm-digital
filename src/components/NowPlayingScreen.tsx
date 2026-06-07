import type { NowPlaying, Slider, Station } from '../types';
import { ThemeIcon } from './ThemeIcon';

interface NowPlayingScreenProps {
  open: boolean;
  station: Station;
  currentSlider: Slider | null;
  sliderLabels: string[];
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  darkMode: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onToggleFavorite: () => void;
  onDarkModeToggle: () => void;
  onSelectLive: () => void;
  onSelectSlider: (slider: Slider) => void;
}

export function NowPlayingScreen({
  open,
  station,
  currentSlider,
  sliderLabels,
  nowPlaying,
  isPlaying,
  isLoading,
  isFavorite,
  darkMode,
  onClose,
  onPlayPause,
  onToggleFavorite,
  onDarkModeToggle,
  onSelectLive,
  onSelectSlider,
}: NowPlayingScreenProps) {
  const hasSliders = (station.sliders?.length ?? 0) > 0;
  const trackLine = nowPlaying?.artist && nowPlaying?.name ? `${nowPlaying.artist} — ${nowPlaying.name}` : nowPlaying?.name || null;
  const subtitle = isLoading
    ? 'טוען...'
    : trackLine
      ? trackLine
      : currentSlider
        ? (sliderLabels[station.sliders?.indexOf(currentSlider) ?? -1] ?? 'שידור מושהה')
        : hasSliders
          ? `${station.name} #1`
          : 'שידור חי';

  const inactiveTab = darkMode
    ? 'bg-white/8 text-white/50 hover:text-white hover:bg-white/12'
    : 'bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200';

  return (
    <div
      className={`fixed inset-0 z-70 flex flex-col ${darkMode ? 'bg-[#0f0f0f] text-white' : 'bg-gray-50 text-gray-900'}
        transition-[transform,opacity] duration-300 ease-out
        ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
    >
      {/* Top bar: back button + theme toggle */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-white/60 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          aria-label="חזרה למסך הראשי"
          title="חזרה למסך הראשי"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          onClick={onDarkModeToggle}
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-white/60 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          aria-label={darkMode ? 'מצב בהיר' : 'מצב כהה'}
          title={darkMode ? 'מצב בהיר' : 'מצב כהה'}
        >
          <ThemeIcon darkMode={darkMode} />
        </button>
      </div>

      {/* Cover + now playing info + controls */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-xl">
          <img
            key={station.slug}
            src={station.cover ?? station.logo}
            alt={station.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = station.logo;
            }}
          />
        </div>

        <div className="text-center w-full max-w-sm min-w-0">
          <p className="font-bold text-xl truncate">{station.name}</p>
          <p className={`text-sm mt-1 truncate ${isLoading ? 'animate-pulse' : ''} ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{subtitle}</p>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onToggleFavorite}
            className={`text-3xl leading-none transition-colors ${isFavorite ? 'text-[#e8192c]' : darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
            title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            aria-label={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>

          <button
            onClick={onPlayPause}
            disabled={isLoading}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all
              ${isLoading ? 'bg-[#e8192c]/40 cursor-wait' : 'bg-[#e8192c] hover:bg-[#c8141f] active:scale-95'}`}
            title={isPlaying ? 'השהה' : 'נגן'}
            aria-label={isPlaying ? 'השהה' : 'נגן'}
          >
            {isLoading ? (
              <span className="block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
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
                width="26"
                height="26"
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

          <div className="w-9" />
        </div>
      </div>

      {/* Slider pills */}
      {hasSliders && (
        <div className="grid grid-cols-2 gap-2 px-6 pb-8 pt-2 shrink-0">
          <button
            onClick={onSelectLive}
            className={`truncate text-center px-4 py-2 rounded-full text-sm font-medium transition-colors
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
              className={`truncate text-center px-4 py-2 rounded-full text-sm font-medium transition-colors
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
