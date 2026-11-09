import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect } from 'react';

/**
 * Очень деликатный параллакс только для устройств с точным указателем.
 * На тач-устройствах и при reduced motion полностью отключается.
 */
export function useParallax(strength = 8) {
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-strength, strength]), {
    stiffness: 55,
    damping: 22,
    mass: 0.6,
  });
  const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-strength, strength]), {
    stiffness: 55,
    damping: 22,
    mass: 0.6,
  });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (event: PointerEvent) => {
      mouseX.set(event.clientX / window.innerWidth - 0.5);
      mouseY.set(event.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mouseX, mouseY, reduce]);

  return { x, y };
}
