import { motion } from 'framer-motion';
import { invitation } from '../../config/invitation';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';
import { EASE } from '../../lib/motion';
import { AmbientParticles } from '../AmbientParticles';
import { Reveal } from '../Reveal';
import { SceneBackground } from '../SceneBackground';
import { PrimaryButton } from '../buttons/PrimaryButton';

type IntroSceneProps = {
  onNext: () => void;
};

export function IntroScene({ onNext }: IntroSceneProps) {
  const showButton = useDelayedFlag(2100);
  const { intro } = invitation.texts;

  return (
    <section className="scene intro-scene" aria-label="Тихий вечер">
      <SceneBackground
        image={invitation.assets.intro}
        tone="intro"
        priority
        zoom
      />
      <AmbientParticles density={26} />

      <div className="scene__scroll">
        <div className="scene__inner intro">
          <header className="intro__top">
            <Reveal delay={0.35} y={10}>
              <p className="wordmark">{intro.wordmark}</p>
            </Reveal>
            <Reveal delay={0.55} y={10}>
              <p className="eyebrow">{intro.label}</p>
            </Reveal>
          </header>

          <div className="intro__center">
            <Reveal delay={0.9} y={26}>
              <h1 className="display display--xl">{intro.title}</h1>
            </Reveal>
            <Reveal delay={1.5} y={16}>
              <p className="lead">{intro.subtitle}</p>
            </Reveal>
          </div>

          <footer className="intro__bottom">
            {showButton ? (
              <motion.div
                className="intro__button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <PrimaryButton fullWidth onClick={onNext}>
                  {intro.cta}
                </PrimaryButton>
              </motion.div>
            ) : (
              <div className="intro__button-placeholder" aria-hidden="true" />
            )}
            <Reveal delay={2.5} y={8}>
              <p className="caption">{invitation.signature}</p>
            </Reveal>
          </footer>
        </div>
      </div>
    </section>
  );
}
