import { useEffect, useState } from 'react';

/**
 * Показывает интерактивный элемент только после задержки.
 * Нужен, чтобы невидимые кнопки не перехватывали нажатия.
 */
export function useDelayedFlag(delay: number, enabled = true): boolean {
  const [ready, setReady] = useState(delay <= 0);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }

    setReady(false);
    const timer = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay, enabled]);

  return ready;
}
