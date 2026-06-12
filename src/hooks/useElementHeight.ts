import { useCallback, useRef, useState } from 'react';

/**
 * Tracks the live height of a DOM element via a callback ref + ResizeObserver,
 * so layout (e.g. content padding) can adapt when the element's size changes
 * (responsive breakpoints, wrapping content, etc.).
 */
export function useElementHeight<T extends HTMLElement>() {
  const [height, setHeight] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!el) {
      setHeight(0);
      return;
    }

    setHeight(el.getBoundingClientRect().height);

    const observer = new ResizeObserver(() => setHeight(el.getBoundingClientRect().height));
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  return [ref, height] as const;
}
