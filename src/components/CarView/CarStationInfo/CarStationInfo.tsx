import type { Station } from '../../../types';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from '../../common/icons';
import { useCarStationImage } from '../useCarStationImage';
import { CarSliderList } from '../CarSliderList/CarSliderList';
import { useCarStationInfo } from './useCarStationInfo';
import { useStore } from '../../../store/store';

interface CarStationInfoProps {
  station: Station;
}

export function CarStationInfo({ station }: CarStationInfoProps) {
  const { goNext, goPrev, hasMultiple } = useCarStationInfo(station);
  const { imgSrc, onError } = useCarStationImage(station);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentStation = useStore((state) => state.currentStation);
  const isPlayingGlobal = useStore((state) => state.isPlaying);
  const isLoadingGlobal = useStore((state) => state.isLoading);
  const nowPlaying = useStore((state) => state.nowPlaying);
  const favorites = useStore((state) => state.favorites);
  const handlePlay = useStore((state) => state.handlePlay);
  const handlePlayPause = useStore((state) => state.handlePlayPause);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  const isActive = currentStation?.slug === station.slug;
  const isPlaying = isActive && isPlayingGlobal;
  const isLoading = isActive && isLoadingGlobal;
  const isFavorite = favorites.includes(station.slug);
  const hasSliders = !!station.sliders?.length;

  const trackLine =
    isActive && nowPlaying?.artist && nowPlaying?.name
      ? `${nowPlaying.artist} — ${nowPlaying.name}`
      : isActive && nowPlaying?.name
        ? nowPlaying.name
        : null;

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 max-w-md mx-auto w-full">
      {/* Cover + name */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <img src={imgSrc} alt={station.name} onError={onError} className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
        <h1 className="text-2xl font-bold text-center">{station.name}</h1>
        {trackLine && <p className={`text-base text-center ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>{trackLine}</p>}
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-6 py-2">
        <button onClick={goNext} disabled={!hasMultiple} aria-label="תחנה הבאה" className="p-3 disabled:opacity-30">
          <SkipForwardIcon size={32} />
        </button>

        <button
          onClick={() => (isActive ? handlePlayPause() : handlePlay(station))}
          disabled={isLoading}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all
            ${isLoading ? 'bg-[#e8192c]/40 cursor-wait' : 'bg-[#e8192c] hover:bg-[#c8141f] active:scale-95'}`}
          aria-label={isPlaying ? 'השהה' : 'נגן'}
        >
          {isLoading ? (
            <span className="block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <PauseIcon size={28} />
          ) : (
            <PlayIcon size={28} />
          )}
        </button>

        <button onClick={goPrev} disabled={!hasMultiple} aria-label="תחנה קודמת" className="p-3 disabled:opacity-30">
          <SkipBackIcon size={32} />
        </button>
      </div>

      {/* Favorite toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => toggleFavorite(station.slug)}
          className={`text-3xl leading-none transition-colors ${isFavorite ? 'text-[#e8192c]' : isDarkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
          aria-label={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      {/* Sliders list */}
      {hasSliders && <CarSliderList station={station} />}
    </div>
  );
}
