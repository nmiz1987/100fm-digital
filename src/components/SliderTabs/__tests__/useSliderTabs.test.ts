import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSliderTabs } from '../useSliderTabs';
import { useStore } from '../../../store/store';

beforeEach(() => {
  useStore.setState({ isDarkMode: true });
});

describe('useSliderTabs', () => {
  it('returns the dark-mode inactive tab classes', () => {
    useStore.setState({ isDarkMode: true });
    const { result } = renderHook(() => useSliderTabs());
    expect(result.current.inactiveTab).toContain('bg-white/8');
  });

  it('returns the light-mode inactive tab classes', () => {
    useStore.setState({ isDarkMode: false });
    const { result } = renderHook(() => useSliderTabs());
    expect(result.current.inactiveTab).toContain('bg-gray-100');
  });
});
