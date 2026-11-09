import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE } from '../lib/motion';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  className?: string;
};

/**
 * Мягкое появление текста: opacity + сдвиг + короткое размытие.
 * При reduced motion остаётся только короткое проявление.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  blur = true,
  className,
}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: reduce ? 0 : y,
        filter: reduce ? 'none' : `blur(${blur ? 6 : 0}px)`,
      }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: reduce ? 0.3 : 0.9,
        delay: reduce ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}
