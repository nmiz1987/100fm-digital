import type { Station } from '../../../types';
import { useStore } from '../../../store/store';
import { useSliderTabs } from './useSliderTabs';

interface SliderTabsProps {
  station: Station;
}

export function SliderTabs({ station }: SliderTabsProps) {
  const { inactiveTab } = useSliderTabs();
  const currentSlider = useStore((state) => state.currentSlider);
  const sliderLabels = useStore((state) => state.sliderLabels);
  const handleSelectLive = useStore((state) => state.handleSelectLive);
  const handleSelectSlider = useStore((state) => state.handleSelectSlider);

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
      <button
        onClick={handleSelectLive}
        title={sliderLabels[0]}
        dir="ltr"
        className={`truncate px-3 py-0.5 rounded-full text-sm font-medium transition-colors
          ${!currentSlider ? 'bg-[#e8192c] text-white' : inactiveTab}`}
      >
        {sliderLabels[0] ?? `${station.name} #1`}
      </button>
      {station.sliders!.map((slider, i) => (
        <button
          key={i}
          onClick={() => handleSelectSlider(slider)}
          title={sliderLabels[i + 1]}
          dir="ltr"
          className={`truncate px-3 py-0.5 rounded-full text-sm font-medium transition-colors
            ${currentSlider?.audio === slider.audio ? 'bg-[#e8192c] text-white' : inactiveTab}`}
        >
          {sliderLabels[i + 1] ?? `${station.name} #${i + 2}`}
        </button>
      ))}
    </div>
  );
}
