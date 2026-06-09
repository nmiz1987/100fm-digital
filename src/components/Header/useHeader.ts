import { useRef, useEffect } from 'react';

export function useHeader(onSearchChange: (v: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onSearchChange('');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onSearchChange]);

  return { inputRef };
}
