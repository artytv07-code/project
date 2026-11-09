import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { invitation } from '../../config/invitation';
import { getMessengerHref } from '../../config/invitation';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';
import { AmbientParticles } from '../AmbientParticles';
import { Reveal } from '../Reveal';
import { SceneBackground } from '../SceneBackground';
import { SecondaryButton } from '../buttons/SecondaryButton';

type FinalSceneProps = {
  onRestart: () => void;
  onCredits: () => void;
};

export function FinalScene({ onRestart, onCredits }: FinalSceneProps) {
  const showActions = useDelayedFlag(2400);
  const reduce = useReducedMotion();
  const { final } = invitation.texts;
  const messengerHref = getMessengerHref();

  return (
    <section className="scene final-scene" aria-labelledby="final-title">
      <SceneBackground
        image={invitation.assets.final}
        tone="warm"
        priority
        zoom
      />
      <AmbientParticles density={40} />
      <div className="final__glow" aria-hidden="true" />

      <div className="scene__scroll">
        <div className="scene__inner final">
          <Reveal delay={0.2} y={10}>
            <motion.div
              className="final__heart"
              animate={
                reduce
                  ? undefined
                  : { scale: [1, 1.08, 1], opacity: [0.82, 1, 0.82] }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <Heart size={30} strokeWidth={1.2} fill="currentColor" />
            </motion.div>
          </Reveal>

          <Reveal delay={0.5} y={10}>
            <p className="eyebrow final__kicker">{final.kicker}</p>
          </Reveal>

          <Reveal delay={0.9} y={22}>
            <h1 id="final-title" className="display display--lg">
              {final.line1}
            </h1>
          </Reveal>

          <Reveal delay={1.4} y={14}>
            <p className="lead final__line">{final.line2}</p>
          </Reveal>

          <Reveal delay={1.9} y={12}>
            <p className="final__signoff">{final.signoff}</p>
          </Reveal>

          <div className="final__actions">
            {showActions && (
              <motion.div
                className="final__actions-inner"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {messengerHref && (
                  <a
                    className="btn btn--primary"
                    href={messengerHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {final.messageCta}
                  </a>
                )}
                <SecondaryButton onClick={onRestart}>
                  {final.restart}
                </SecondaryButton>
              </motion.div>
            )}
          </div>

          <Reveal delay={2.7} y={8}>
            <p className="caption final__signature">{final.signature}</p>
          </Reveal>

          {invitation.creditsEnabled && (
            <button type="button" className="text-btn final__credits" onClick={onCredits}>
              {final.credits}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
