import { useEffect, useState } from 'react';

const WARNING_DELAY = 10_000;
const WARNING_DURATION = 3_000;

export function useLoadingTimeoutWarning(isLoading: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setVisible(false);
      return;
    }
    const id = setTimeout(() => setVisible(true), WARNING_DELAY);
    return () => clearTimeout(id);
  }, [isLoading]);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setVisible(false), WARNING_DURATION);
    return () => clearTimeout(id);
  }, [visible]);

  return { visible, dismiss: () => setVisible(false) };
}
