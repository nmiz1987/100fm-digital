import { useStore } from '../../store/store';
import { VolumeOffIcon, VolumeLowIcon, VolumeHighIcon } from '../common/icons';

export function VolumeSlider() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const volume = useStore((state) => state.volume);
  const setVolume = useStore((state) => state.setVolume);

  return (
    <div className="hidden sm:flex items-center gap-2 shrink-0 w-32">
      <span className={`select-none ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
        {volume === 0 ? <VolumeOffIcon /> : volume < 0.5 ? <VolumeLowIcon /> : <VolumeHighIcon />}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="flex-1 accent-[#e8192c] cursor-pointer"
        title="ווליום"
        dir="ltr"
      />
    </div>
  );
}
