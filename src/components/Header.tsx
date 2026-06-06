import { useRef, useEffect } from 'react';

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export function Header({ search, onSearchChange, darkMode, onDarkModeToggle }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onSearchChange('');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onSearchChange]);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur border-b px-4 py-3 ${darkMode ? 'bg-[#0f0f0f]/95 border-white/5' : 'bg-white/95 border-gray-200 shadow-sm'}`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <img src="/icon.svg" alt="100FM" className="h-8 w-8 shrink-0 block" />
          <span className={`font-bold text-lg hidden sm:block ${darkMode ? 'text-white' : 'text-gray-900'}`}>100FM Digital</span>
        </div>

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

        {/* Dark mode toggle */}
        <button
          onClick={onDarkModeToggle}
          className={`shrink-0 p-2 rounded-lg transition-colors ${darkMode ? 'text-white/60 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          aria-label={darkMode ? 'מצב בהיר' : 'מצב כהה'}
          title={darkMode ? 'מצב בהיר' : 'מצב כהה'}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
