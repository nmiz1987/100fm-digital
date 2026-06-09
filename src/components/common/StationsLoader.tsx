interface StationsLoaderProps {
  darkMode: boolean;
}

export function StationsLoader({ darkMode }: StationsLoaderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div className={`w-12 h-12 rounded-full border-4 border-t-[#e8192c] animate-spin ${darkMode ? 'border-white/10' : 'border-gray-200'}`} />
      <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>טוען תחנות...</p>
    </div>
  );
}
