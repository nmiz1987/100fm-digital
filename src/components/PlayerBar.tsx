import type { Station, Slider, NowPlaying } from '../types'

interface PlayerBarProps {
  station: Station
  currentSlider: Slider | null
  sliderLabels: string[]
  nowPlaying: NowPlaying | null
  isPlaying: boolean
  isLoading: boolean
  volume: number
  isFavorite: boolean
  onPlayPause: () => void
  onStop: () => void
  onVolumeChange: (v: number) => void
  onToggleFavorite: () => void
  onSelectLive: () => void
  onSelectSlider: (slider: Slider) => void
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
  onPlayPause,
  onStop,
  onVolumeChange,
  onToggleFavorite,
  onSelectLive,
  onSelectSlider,
}: PlayerBarProps) {
  const hasSliders = (station.sliders?.length ?? 0) > 0
  const trackLine = nowPlaying?.artist && nowPlaying?.name
    ? `${nowPlaying.artist} — ${nowPlaying.name}`
    : nowPlaying?.name || null

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/98 backdrop-blur border-t border-white/8 flex flex-col ${hasSliders ? 'pb-1' : ''}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-2 h-[70px] md:h-[72px]">
        {/* Station info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={station.cover ?? station.logo}
            alt={station.name}
            className="h-10 w-10 rounded object-cover shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = station.logo }}
          />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{station.name}</p>
            {isLoading ? (
              <p className="text-white/40 text-xs animate-pulse">טוען...</p>
            ) : trackLine ? (
              <p className="text-white/50 text-xs truncate">{trackLine}</p>
            ) : (
              <p className="text-white/30 text-xs">
                {currentSlider
                  ? (sliderLabels[station.sliders?.indexOf(currentSlider) ?? -1] ?? 'שידור מושהה')
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
              ${isFavorite ? 'text-[#e8192c]' : 'text-white/40 hover:text-white/80'}`}
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
              <span className="text-base">⏸</span>
            ) : (
              <span className="text-base mr-0.5">▶</span>
            )}
          </button>

          <button
            onClick={onStop}
            className="p-2 text-white/40 hover:text-white/80 transition-colors text-sm rounded-full"
            title="עצור"
          >
            ✕
          </button>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 w-32">
          <span className="text-white/40 text-sm select-none">
            {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
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
              ${!currentSlider
                ? 'bg-[#e8192c] text-white'
                : 'bg-white/8 text-white/50 hover:text-white hover:bg-white/12'
              }`}
          >
            שידור חי
          </button>
          {station.sliders!.map((slider, i) => (
            <button
              key={i}
              onClick={() => onSelectSlider(slider)}
              title={sliderLabels[i]}
              dir="ltr"
              className={`max-w-[160px] truncate px-3 py-0.5 rounded-full text-xs font-medium transition-colors
                ${currentSlider?.audio === slider.audio
                  ? 'bg-[#e8192c] text-white'
                  : 'bg-white/8 text-white/50 hover:text-white hover:bg-white/12'
                }`}
            >
              {sliderLabels[i] ?? `#${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
