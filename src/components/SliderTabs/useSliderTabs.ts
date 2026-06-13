import { useStore } from '../../store/store';

export function useSliderTabs() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const inactiveTab = isDarkMode
    ? 'bg-white/8 text-white/50 hover:text-white hover:bg-white/12'
    : 'bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200';

  return { inactiveTab };
}
