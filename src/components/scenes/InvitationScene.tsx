import { motion } from 'framer-motion';
import { invitation } from '../../config/invitation';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';
import { useParallax } from '../../hooks/useParallax';
import { AmbientParticles } from '../AmbientParticles';
import { Reveal } from '../Reveal';
import { SceneBackground } from '../SceneBackground';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { SecondaryButton } from '../buttons/SecondaryButton';

type InvitationSceneProps = {
  onAccept: () => void;
  onDetails: () => void;
};

export function InvitationScene({
  onAccept,
  onDetails,
}: InvitationSceneProps) {
  const showActions = useDelayedFlag(1700);
  const { x, y } = useParallax(8);
  const { invitation: texts } = invitation.texts;

  return (
    <section className="scene invitation-scene" aria-labelledby="invitation-title">
      <motion.div className="invitation__bg" style={{ x, y }}>
        <SceneBackground
          image={invitation.assets.invitation}
          tone="warm"
          priority
          zoom
        />
      </motion.div>

      <AmbientParticles density={30} />

      <div className="scene__scroll">
        <div className="scene__inner invitation">
          <Reveal delay={0.2} y={10}>
            <p className="eyebrow">{texts.eyebrow}</p>
          </Reveal>

          <Reveal delay={0.5} y={24}>
            <h1 id="invitation-title" className="display display--xl">
              {texts.title}
            </h1>
          </Reveal>

          <Reveal delay={0.9} y={14}>
            <p className="invitation__question">{texts.question}</p>
          </Reveal>

          <Reveal delay={1.2} y={14} className="invitation__body">
            {texts.body.map((paragraph) => (
              <p className="lead" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={1.5} y={10}>
            <p className="tagline">{texts.tagline}</p>
          </Reveal>

          <div className="invitation__actions">
            {showActions && (
              <motion.div
                className="invitation__actions-inner"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <PrimaryButton onClick={onAccept}>
                  {texts.primary}
                </PrimaryButton>
                <SecondaryButton onClick={onDetails}>
                  {texts.secondary}
                </SecondaryButton>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
