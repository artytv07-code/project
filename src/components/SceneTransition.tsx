import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE } from '../lib/motion';

type SceneTransitionProps = {
  children: ReactNode;
  direction: number;
};

export function SceneTransition({
  children,
  direction,
}: SceneTransitionProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="scene-layer"
      initial={{
        opacity: 0,
        x: reduce ? 0 : direction * 14,
        scale: reduce ? 1 : 1.008,
      }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: reduce ? 0 : direction * -10,
        scale: reduce ? 1 : 0.996,
      }}
      transition={{ duration: reduce ? 0.3 : 0.65, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
