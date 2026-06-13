import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHeader } from '../useHeader';

describe('useHeader', () => {
  it('returns an inputRef', () => {
    const { result } = renderHook(() => useHeader(vi.fn()));
    expect(result.current.inputRef).toEqual({ current: null });
  });

  it('clears the search on Escape key', () => {
    const onSearchChange = vi.fn();
    renderHook(() => useHeader(onSearchChange));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('does not clear the search on other keys', () => {
    const onSearchChange = vi.fn();
    renderHook(() => useHeader(onSearchChange));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it('removes the keydown listener on unmount', () => {
    const onSearchChange = vi.fn();
    const { unmount } = renderHook(() => useHeader(onSearchChange));

    unmount();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onSearchChange).not.toHaveBeenCalled();
  });
});
