import { useHeader } from './useHeader';
import { SunIcon, MoonIcon, CarIcon } from '../common/icons';

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onCarModeEnter: () => void;
}

export function Header({ search, onSearchChange, darkMode, onDarkModeToggle, onCarModeEnter }: HeaderProps) {
  const { inputRef } = useHeader(onSearchChange);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur border-b px-4 py-3 ${darkMode ? 'bg-[#0f0f0f]/95 border-white/5' : 'bg-white/95 border-gray-200 shadow-sm'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חיפוש תחנה..."
            className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#e8192c]/60 transition-colors ${
              darkMode
                ? 'bg-white/8 border-white/10 text-white placeholder-white/40 focus:bg-white/10'
                : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white'
            }`}
            dir="rtl"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-white/40 hover:text-white/80' : 'text-gray-400 hover:text-gray-700'}`}
              aria-label="נקה חיפוש"
            >
              ✕
            </button>
          )}
        </div>

        {/* Car mode entry — small screens only */}
        <button
          onClick={onCarModeEnter}
          className={`shrink-0 p-2 rounded-lg transition-colors sm:hidden ${darkMode ? 'text-white/60 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          aria-label="מצב רכב"
          title="מצב רכב"
        >
          <CarIcon />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onDarkModeToggle}
          className={`shrink-0 p-2 rounded-lg transition-colors ${darkMode ? 'text-white/60 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          aria-label={darkMode ? 'מצב בהיר' : 'מצב כהה'}
          title={darkMode ? 'מצב בהיר' : 'מצב כהה'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
