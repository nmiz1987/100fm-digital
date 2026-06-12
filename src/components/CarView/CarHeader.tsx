import { BackIcon, ExitIcon } from '../common/icons';

interface CarHeaderProps {
  darkMode: boolean;
  onExit: () => void;
  onBack?: () => void;
}

export function CarHeader({ darkMode, onExit, onBack }: CarHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'bg-[#0f0f0f] border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}
    >
      <span className="text-lg font-bold">מצב רכב</span>
      {onBack ? (
        <button
          onClick={onBack}
          className={`shrink-0 p-2 rounded-lg transition-colors ${darkMode ? 'text-white/60 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          aria-label="חזרה לרשימת התחנות"
          title="חזרה לרשימת התחנות"
        >
          <BackIcon size={22} />
        </button>
      ) : (
        <button
          onClick={onExit}
          className={`shrink-0 p-2 rounded-lg transition-colors ${darkMode ? 'text-white/60 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          aria-label="יציאה ממצב רכב"
          title="יציאה ממצב רכב"
        >
          <ExitIcon size={22} />
        </button>
      )}
    </header>
  );
}
