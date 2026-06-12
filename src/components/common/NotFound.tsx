import { Link } from 'react-router-dom';

interface NotFoundProps {
  darkMode: boolean;
}

export function NotFound({ darkMode }: NotFoundProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-3 text-lg ${darkMode ? 'bg-[#0f0f0f] text-white/30' : 'bg-gray-50 text-gray-400'}`}>
      <p className="text-2xl font-bold">404</p>
      <p>הדף לא נמצא</p>
      <Link to="/" className="text-[#e8192c] underline">
        חזרה לדף הבית
      </Link>
    </div>
  );
}
