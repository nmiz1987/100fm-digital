interface LoadingTimeoutToastProps {
  visible: boolean;
  darkMode: boolean;
  onDismiss: () => void;
}

export function LoadingTimeoutToast({ visible, darkMode, onDismiss }: LoadingTimeoutToastProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onDismiss}
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] px-4 py-2.5 rounded-xl text-sm shadow-lg backdrop-blur border transition-colors text-center
        ${darkMode ? 'bg-[#1a1a1a]/95 border-white/10 text-white/80 hover:bg-[#1a1a1a]' : 'bg-white/95 border-gray-200 text-gray-700 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:bg-white'}`}
      title="לחצו כדי לסגור"
    >
      הטעינה אורכת זמן רב מהרגיל, ייתכן שיש בעיה בשידור
    </button>
  );
}
