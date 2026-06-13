import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElementHeight } from '../useElementHeight';

type ResizeCallback = () => void;

const observers: { callback: ResizeCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];

class MockResizeObserver {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;

  constructor(callback: ResizeCallback) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    observers.push({ callback, observe: this.observe, disconnect: this.disconnect });
  }

  unobserve() {}
}

let originalResizeObserver: typeof ResizeObserver;

beforeEach(() => {
  observers.length = 0;
  originalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  window.ResizeObserver = originalResizeObserver;
});

function makeElement(height: number): HTMLDivElement {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({ height } as DOMRect);
  return el;
}

describe('useElementHeight', () => {
  it('starts with a height of 0', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());
    const [, height] = result.current;
    expect(height).toBe(0);
  });

  it('measures the element height when the ref is attached', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    act(() => {
      result.current[0](makeElement(48));
    });

    expect(result.current[1]).toBe(48);
  });

  it('observes the element for resizes', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());
    const el = makeElement(48);

    act(() => {
      result.current[0](el);
    });

    expect(observers).toHaveLength(1);
    expect(observers[0].observe).toHaveBeenCalledWith(el);
  });

  it('updates the height when the observer fires', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());
    const el = makeElement(48);

    act(() => {
      result.current[0](el);
    });

    el.getBoundingClientRect = () => ({ height: 96 } as DOMRect);
    act(() => {
      observers[0].callback();
    });

    expect(result.current[1]).toBe(96);
  });

  it('disconnects the previous observer when the ref changes', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    act(() => {
      result.current[0](makeElement(48));
    });
    const firstDisconnect = observers[0].disconnect;

    act(() => {
      result.current[0](makeElement(64));
    });

    expect(firstDisconnect).toHaveBeenCalled();
    expect(result.current[1]).toBe(64);
  });

  it('resets the height to 0 and disconnects when the ref is detached', () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());

    act(() => {
      result.current[0](makeElement(48));
    });
    const disconnect = observers[0].disconnect;

    act(() => {
      result.current[0](null);
    });

    expect(disconnect).toHaveBeenCalled();
    expect(result.current[1]).toBe(0);
  });
});
