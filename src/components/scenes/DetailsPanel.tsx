import { motion } from 'framer-motion';
import { invitation } from '../../config/invitation';
import { getWhereAnswer, getWhenAnswer } from '../../config/invitation';
import { EASE } from '../../lib/motion';
import { AmbientParticles } from '../AmbientParticles';
import { SceneBackground } from '../SceneBackground';
import { PrimaryButton } from '../buttons/PrimaryButton';

type DetailsPanelProps = {
  onAccept: () => void;
  onCredits: () => void;
};

export function DetailsPanel({ onAccept, onCredits }: DetailsPanelProps) {
  const { panel } = invitation.texts;
  const blocks = [
    {
      number: '01',
      question: panel.whenQuestion,
      answer: getWhenAnswer(),
    },
    {
      number: '02',
      question: panel.whereQuestion,
      answer: getWhereAnswer(),
    },
    {
      number: '03',
      question: panel.whatQuestion,
      answer: panel.whatAnswer,
    },
  ];

  return (
    <section className="scene panel-scene" aria-labelledby="panel-title">
      <SceneBackground
        image={invitation.assets.panel}
        tone="deep"
        blurred
      />
      <AmbientParticles density={16} />

      <div className="scene__scroll">
        <div className="scene__inner panel-scene__inner">
          <motion.article
            className="panel"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            <header className="panel__head">
              <p className="eyebrow">{panel.eyebrow}</p>
              <h1 id="panel-title" className="display display--lg">
                {panel.title}
              </h1>
              <p className="lead">{panel.intro}</p>
            </header>

            <div className="panel__blocks">
              {blocks.map((block, index) => (
                <motion.div
                  className="panel__block"
                  key={block.question}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.35 + index * 0.15,
                    ease: EASE,
                  }}
                >
                  <span className="panel__number">{block.number}</span>
                  <div>
                    <h2>{block.question}</h2>
                    <p>{block.answer}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="panel__closing">{panel.closing}</p>

            <div className="panel__actions">
              <PrimaryButton onClick={onAccept}>{panel.cta}</PrimaryButton>
              {invitation.creditsEnabled && (
                <button type="button" className="text-btn" onClick={onCredits}>
                  {panel.credits}
                </button>
              )}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
