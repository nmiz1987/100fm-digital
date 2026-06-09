import { useState } from 'react';
import type { Station } from '../../types';

export function useStationCard(station: Station) {
  const [imgSrc, setImgSrc] = useState(station.cover ?? station.logo);
  return { imgSrc, setImgSrc };
}
