import { useStore } from '../../../store/store';
import type { Station, Slider } from '../../../types';

interface CarSliderListProps {
  station: Station;
}

export function CarSliderList({ station }: CarSliderListProps) {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const currentStation = useStore((state) => state.currentStation);
  const currentSlider = useStore((state) => state.currentSlider);
  const sliderLabels = useStore((state) => state.sliderLabels);
  const handlePlay = useStore((state) => state.handlePlay);
  const handleSelectLive = useStore((state) => state.handleSelectLive);
  const handleSelectSlider = useStore((state) => state.handleSelectSlider);

  const isActive = currentStation?.slug === station.slug;
  const activeSlider = isActive ? currentSlider : null;
  const onSelectLive = () => (isActive ? handleSelectLive() : handlePlay(station));
  const onSelectSlider = (slider: Slider) => (isActive ? handleSelectSlider(slider) : handlePlay(station));

  const active = 'bg-[#e8192c] text-white';
  const inactive = isDarkMode ? 'bg-white/8 text-white/60 hover:bg-white/12' : 'bg-gray-100 text-gray-600 hover:bg-gray-200';

  return (
    <div className="flex flex-col gap-2 mt-2">
      <button
        onClick={onSelectLive}
        dir="ltr"
        className={`text-lg font-medium px-4 py-3 rounded-xl text-center transition-colors ${!activeSlider ? active : inactive}`}
      >
        {sliderLabels[0] ?? `${station.name} #1`}
      </button>
      {station.sliders!.map((slider, i) => (
        <button
          key={i}
          onClick={() => onSelectSlider(slider)}
          dir="ltr"
          className={`text-lg font-medium px-4 py-3 rounded-xl text-center transition-colors ${activeSlider?.audio === slider.audio ? active : inactive}`}
        >
          {sliderLabels[i + 1] ?? `${station.name} #${i + 2}`}
        </button>
      ))}
    </div>
  );
}
