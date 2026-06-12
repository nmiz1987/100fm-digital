import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import type { Station, Slider } from '../types';

export function usePlayer(initialVolume: number) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [currentSlider, setCurrentSlider] = useState<Slider | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = initialVolume;
    }
    const audio = audioRef.current;
    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
    };
  }, [initialVolume]);

  const destroyHls = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  const loadAudio = (src: string, fallbackSrc?: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    destroyHls();
    audio.pause();
    setIsLoading(true);

    if (Hls.isSupported() && src.includes('.m3u8')) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void audio.play();
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal && fallbackSrc) {
          destroyHls();
          audio.src = fallbackSrc;
          void audio.play();
        }
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl') && src.includes('.m3u8')) {
      audio.src = src;
      void audio.play();
    } else {
      audio.src = fallbackSrc ?? src;
      void audio.play();
    }
  };

  const play = (station: Station) => {
    setCurrentStation(station);
    setCurrentSlider(null);
    loadAudio(station.audio, station.audioA);
  };

  const playSlider = (slider: Slider, station: Station) => {
    setCurrentStation(station);
    setCurrentSlider(slider);
    loadAudio(slider.audio);
  };

  const playLive = (station: Station) => {
    setCurrentSlider(null);
    loadAudio(station.audio, station.audioA);
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const resume = () => {
    void audioRef.current?.play();
  };

  const stop = () => {
    destroyHls();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setCurrentStation(null);
    setCurrentSlider(null);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  return { currentStation, currentSlider, isPlaying, isLoading, volume, play, playSlider, playLive, pause, resume, stop, setVolume };
}
