import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import {
  EyeIcon,
  EyeOffIcon,
  VolumeOffIcon,
  VolumeLowIcon,
  VolumeHighIcon,
  PauseIcon,
  PlayIcon,
  ListViewIcon,
  GridViewIcon,
  SunIcon,
  MoonIcon,
  CarIcon,
  SkipBackIcon,
  SkipForwardIcon,
  BackIcon,
  ExitIcon,
} from '../icons';

interface IconProps {
  size?: number;
}

const icons: [string, ComponentType<IconProps>, number][] = [
  ['EyeIcon', EyeIcon, 17],
  ['EyeOffIcon', EyeOffIcon, 17],
  ['VolumeOffIcon', VolumeOffIcon, 17],
  ['VolumeLowIcon', VolumeLowIcon, 17],
  ['VolumeHighIcon', VolumeHighIcon, 17],
  ['PauseIcon', PauseIcon, 18],
  ['PlayIcon', PlayIcon, 18],
  ['ListViewIcon', ListViewIcon, 18],
  ['GridViewIcon', GridViewIcon, 18],
  ['SunIcon', SunIcon, 18],
  ['MoonIcon', MoonIcon, 18],
  ['CarIcon', CarIcon, 18],
  ['SkipBackIcon', SkipBackIcon, 18],
  ['SkipForwardIcon', SkipForwardIcon, 18],
  ['BackIcon', BackIcon, 18],
  ['ExitIcon', ExitIcon, 18],
];

describe('icons', () => {
  it.each(icons)('%s renders an svg with the default size %i', (_name, Icon, defaultSize) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', String(defaultSize));
    expect(svg).toHaveAttribute('height', String(defaultSize));
  });

  it.each(icons)('%s renders an svg with a custom size', (_name, Icon) => {
    const { container } = render(<Icon size={32} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});
