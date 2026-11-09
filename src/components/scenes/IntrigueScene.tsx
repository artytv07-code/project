import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { invitation } from '../../config/invitation';
import { EASE } from '../../lib/motion';
import { AmbientParticles } from '../AmbientParticles';
import { SceneBackground } from '../SceneBackground';
import { PrimaryButton } from '../buttons/PrimaryButton';

type IntrigueSceneProps = {
  onNext: () => void;
};

export function IntrigueScene({ onNext }: IntrigueSceneProps) {
  const [phase, setPhase] = useState(0);
  const { intrigue } = invitation.texts;
  const textPhase = Math.min(phase, 2);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 2000),
      window.setTimeout(() => setPhase(2), 4000),
      window.setTimeout(() => setPhase(3), 5800),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <section className="scene intrigue-scene" aria-label="Интрига">
      <SceneBackground image={invitation.assets.intrigue} tone="default" />
      <div className="intrigue__veil" aria-hidden="true" />
      <AmbientParticles density={14} />

      <div className="scene__scroll">
        <div className="scene__inner intrigue">
          <div className="intrigue__copy">
            <AnimatePresence mode="wait">
              <motion.p
                key={textPhase}
                className={[
                  'intrigue__line',
                  textPhase === 0 ? 'is-whisper' : '',
                  textPhase === 1 ? 'is-large' : '',
                  textPhase === 2 ? 'is-medium' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(7px)', y: -10 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                {intrigue.lines[textPhase]}
              </motion.p>
            </AnimatePresence>

            <div className="intrigue__cta">
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <PrimaryButton onClick={onNext}>
                    {intrigue.cta}
                  </PrimaryButton>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
