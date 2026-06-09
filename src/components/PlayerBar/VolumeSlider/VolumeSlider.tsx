import { VolumeOffIcon, VolumeLowIcon, VolumeHighIcon } from '../../common/icons';

interface VolumeSliderProps {
  volume: number;
  darkMode: boolean;
  onChange: (v: number) => void;
}

export function VolumeSlider({ volume, darkMode, onChange }: VolumeSliderProps) {
  return (
    <div className="hidden sm:flex items-center gap-2 shrink-0 w-32">
      <span className={`select-none ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
        {volume === 0 ? <VolumeOffIcon /> : volume < 0.5 ? <VolumeLowIcon /> : <VolumeHighIcon />}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-[#e8192c] cursor-pointer"
        title="ווליום"
        dir="ltr"
      />
    </div>
  );
}
