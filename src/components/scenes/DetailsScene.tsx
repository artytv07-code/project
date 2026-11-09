import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { invitation } from '../../config/invitation';
import { getImage } from '../../data/images';
import { EASE } from '../../lib/motion';
import { AmbientParticles } from '../AmbientParticles';
import { ResponsiveImage } from '../ResponsiveImage';
import { SceneBackground } from '../SceneBackground';
import { PrimaryButton } from '../buttons/PrimaryButton';

type DetailsSceneProps = {
  onNext: () => void;
};

export function DetailsScene({ onNext }: DetailsSceneProps) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const { details } = invitation.texts;
  const frames = details.frames;
  const current = frames[index];
  const entry = getImage(current.image);

  useEffect(() => {
    if (finished) return;

    const delay = index === 0 ? 3200 : 2800;
    const timer = window.setTimeout(() => {
      if (index < frames.length - 1) {
        setIndex((value) => value + 1);
      } else {
        setFinished(true);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [index, finished, frames.length]);

  const skip = () => {
    setIndex(frames.length - 1);
    setFinished(true);
  };

  return (
    <section className="scene details-scene" aria-label="Маленькие детали вечера">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.image}
          className="details__bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <SceneBackground
            image={current.image}
            variant="detail"
            tone="detail"
            blurred
          />
        </motion.div>
      </AnimatePresence>

      <AmbientParticles density={18} />

      <div className="scene__scroll">
        <div className="scene__inner details">
          {finished ? (
            <motion.div
              className="details__ending"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <p className="eyebrow">Маленькие детали</p>
              <h1 className="display display--lg">{details.ending}</h1>
              <PrimaryButton onClick={onNext}>{details.cta}</PrimaryButton>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.image}
                  className="details__slide"
                  initial={{ opacity: 0, y: 16, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.992 }}
                  transition={{ duration: 0.75, ease: EASE }}
                >
                  <figure
                    className="detail-card"
                    style={{ backgroundImage: `url(${entry.lqip})` }}
                  >
                    <ResponsiveImage
                      image={current.image}
                      variant="detail"
                      sizes="(max-width: 767px) 70vw, 380px"
                      alt={entry.alt}
                      priority={index === 0}
                      imgClassName="detail-card__img"
                    />
                  </figure>

                  <div className="details__copy">
                    <p className="details__counter">
                      {String(index + 1).padStart(2, '0')} /{' '}
                      {String(frames.length).padStart(2, '0')}
                    </p>
                    <p className="details__caption">{current.text}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="details__footer">
                <div className="details__progress" aria-hidden="true">
                  {frames.map((frame, frameIndex) => (
                    <span
                      key={frame.image}
                      className={
                        frameIndex === index
                          ? 'is-active'
                          : frameIndex < index
                            ? 'is-past'
                            : ''
                      }
                    />
                  ))}
                </div>
                <button type="button" className="text-btn" onClick={skip}>
                  {details.skip}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
