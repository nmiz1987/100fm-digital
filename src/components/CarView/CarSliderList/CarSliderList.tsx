import type { Station, Slider } from '../../../types';

interface CarSliderListProps {
  station: Station;
  currentSlider: Slider | null;
  sliderLabels: string[];
  darkMode: boolean;
  onSelectLive: () => void;
  onSelectSlider: (slider: Slider) => void;
}

export function CarSliderList({ station, currentSlider, sliderLabels, darkMode, onSelectLive, onSelectSlider }: CarSliderListProps) {
  const active = 'bg-[#e8192c] text-white';
  const inactive = darkMode ? 'bg-white/8 text-white/60 hover:bg-white/12' : 'bg-gray-100 text-gray-600 hover:bg-gray-200';

  return (
    <div className="flex flex-col gap-2 mt-2">
      <button
        onClick={onSelectLive}
        dir="ltr"
        className={`text-lg font-medium px-4 py-3 rounded-xl text-center transition-colors ${!currentSlider ? active : inactive}`}
      >
        {sliderLabels[0] ?? `${station.name} #1`}
      </button>
      {station.sliders!.map((slider, i) => (
        <button
          key={i}
          onClick={() => onSelectSlider(slider)}
          dir="ltr"
          className={`text-lg font-medium px-4 py-3 rounded-xl text-center transition-colors ${currentSlider?.audio === slider.audio ? active : inactive}`}
        >
          {sliderLabels[i + 1] ?? `${station.name} #${i + 2}`}
        </button>
      ))}
    </div>
  );
}
