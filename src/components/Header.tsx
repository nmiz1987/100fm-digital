import { useRef, useEffect } from 'react'

interface HeaderProps {
  search: string
  onSearchChange: (v: string) => void
  darkMode: boolean
  onDarkModeToggle: () => void
}

export function Header({ search, onSearchChange, darkMode, onDarkModeToggle }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onSearchChange('')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onSearchChange])

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/5 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <img
            src="https://d203uamca1bsc4.cloudfront.net/app/logo/x-100fmlive.png"
            alt="100FM"
            className="h-8 w-8 rounded"
          />
          <span className="font-bold text-white text-lg hidden sm:block">100FM Digital</span>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חיפוש תחנה..."
            className="w-full bg-white/8 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#e8192c]/60 focus:bg-white/10 transition-colors"
            dir="rtl"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              aria-label="נקה חיפוש"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={onDarkModeToggle}
          className="shrink-0 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          aria-label={darkMode ? 'מצב בהיר' : 'מצב כהה'}
          title={darkMode ? 'מצב בהיר' : 'מצב כהה'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
