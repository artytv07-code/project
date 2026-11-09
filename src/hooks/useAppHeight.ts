import { useEffect } from 'react';

/**
 * Страховка для старых iOS: сохраняем фактическую высоту окна
 * в CSS-переменную. В современных браузерах используется 100dvh.
 */
export function useAppHeight(): void {
  useEffect(() => {
    const update = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`,
      );
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
}
