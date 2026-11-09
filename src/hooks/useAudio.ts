import { useCallback, useEffect, useRef, useState } from 'react';

type AudioOptions = {
  src: string;
  volume: number;
};

type AudioState = {
  enabled: boolean;
  available: boolean;
  start: () => Promise<void>;
  toggle: () => Promise<void>;
  stop: () => void;
};

/**
 * Музыка выключена по умолчанию. Воспроизведение начинается только
 * после явного жеста; громкость меняется плавно.
 */
export function useAudio({ src, volume }: AudioOptions): AudioState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const playingRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.preload = 'metadata';
    audio.volume = 0;
    audioRef.current = audio;

    const onError = () => {
      playingRef.current = false;
      setEnabled(false);
      setAvailable(false);
    };
    const onReady = () => setAvailable(true);

    audio.addEventListener('error', onError);
    audio.addEventListener('canplaythrough', onReady);

    return () => {
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplaythrough', onReady);
      if (fadeRef.current !== null) {
        cancelAnimationFrame(fadeRef.current);
        fadeRef.current = null;
      }
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
      playingRef.current = false;
    };
  }, [src]);

  const fadeTo = useCallback((target: number, duration: number) => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve();

    if (fadeRef.current !== null) {
      cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    }

    const startVolume = audio.volume;
    const startTime = performance.now();

    return new Promise<void>((resolve) => {
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - (1 - progress) ** 3;
        audio.volume = Math.max(
          0,
          Math.min(1, startVolume + (target - startVolume) * eased),
        );

        if (progress < 1) {
          fadeRef.current = requestAnimationFrame(tick);
        } else {
          fadeRef.current = null;
          resolve();
        }
      };

      fadeRef.current = requestAnimationFrame(tick);
    });
  }, []);

  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      playingRef.current = true;
      setEnabled(true);
      setAvailable(true);
      await fadeTo(volume, 1600);
    } catch {
      playingRef.current = false;
      setEnabled(false);
    }
  }, [fadeTo, volume]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingRef.current) {
      playingRef.current = false;
      setEnabled(false);
      await fadeTo(0, 700);
      audio.pause();
    } else {
      await start();
    }
  }, [fadeTo, start]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    playingRef.current = false;
    setEnabled(false);
    if (fadeRef.current !== null) {
      cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    }
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0;
  }, []);

  return { enabled, available, start, toggle, stop };
}
