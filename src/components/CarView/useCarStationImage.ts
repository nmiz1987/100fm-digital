import { useState } from 'react';
import type { Station } from '../../types';

export function useCarStationImage(station: Station) {
  const [imgSrc, setImgSrc] = useState(station.carIcon ?? station.cover ?? station.logo);

  const onError = () => {
    if (imgSrc !== (station.cover ?? station.logo)) {
      setImgSrc(station.cover ?? station.logo);
    } else if (imgSrc !== station.logo) {
      setImgSrc(station.logo);
    }
  };

  return { imgSrc, onError };
}
