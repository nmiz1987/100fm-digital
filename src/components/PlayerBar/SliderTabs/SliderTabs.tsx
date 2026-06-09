import type { Station, Slider } from '../../../types';
import { useSliderTabs } from './useSliderTabs';

interface SliderTabsProps {
  station: Station;
  currentSlider: Slider | null;
  sliderLabels: string[];
  darkMode: boolean;
  onSelectLive: () => void;
  onSelectSlider: (slider: Slider) => void;
}

export function SliderTabs({ station, currentSlider, sliderLabels, darkMode, onSelectLive, onSelectSlider }: SliderTabsProps) {
  const { inactiveTab } = useSliderTabs(darkMode);

  return (
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
  );
}
