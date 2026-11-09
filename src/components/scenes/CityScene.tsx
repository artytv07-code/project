import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { invitation } from '../../config/invitation';
import { useParallax } from '../../hooks/useParallax';
import { EASE } from '../../lib/motion';
import { AmbientParticles } from '../AmbientParticles';
import { SceneBackground } from '../SceneBackground';
import { PrimaryButton } from '../buttons/PrimaryButton';

type CitySceneProps = {
  onNext: () => void;
};

/** Делит строку на основную фразу и акцент после первой точки. */
function splitCityLine(line: string): [string, string] {
  const dot = line.indexOf('. ');
  if (dot === -1) return [line, ''];
  return [line.slice(0, dot + 1), line.slice(dot + 2)];
}

export function CityScene({ onNext }: CitySceneProps) {
  const [phase, setPhase] = useState(0);
  const { x, y } = useParallax(10);
  const { city } = invitation.texts;
  const images = invitation.assets.city;
  const textPhase = Math.min(phase, 2);
  const [cityHeadline, cityAccent] = splitCityLine(city.lines[1] ?? '');
  const activeImage = Math.min(phase, images.length - 1);
  const showNext = phase >= 3;

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 3200),
      window.setTimeout(() => setPhase(2), 6500),
      window.setTimeout(() => setPhase(3), 9000),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <section className="scene city-scene" aria-label="Вечерний город">
      <motion.div className="city__backgrounds" style={{ x, y }}>
        {images.map((image, index) => (
          <motion.div
            key={image}
            className={`city__layer city__layer--${image}`}
            initial={false}
            animate={{ opacity: index === activeImage ? 1 : 0 }}
            transition={{ duration: 1.8, ease: EASE }}
          >
            <SceneBackground
              image={image}
              tone="city"
              zoom={index === activeImage}
            />
          </motion.div>
        ))}
      </motion.div>

      <AmbientParticles density={20} />

      <div className="scene__scroll">
        <div className="scene__inner city">
          <div className="city__copy">
            <AnimatePresence mode="wait">
              <motion.div
                key={textPhase}
                className="city__text"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
                transition={{ duration: 0.85, ease: EASE }}
              >
                {textPhase === 0 && (
                  <p className="city__whisper">{city.lines[0]}</p>
                )}
                {textPhase === 1 && (
                  <h1 className="display display--lg">
                    {cityHeadline}
                    {cityAccent && <span>{cityAccent}</span>}
                  </h1>
                )}
                {textPhase === 2 && (
                  <h1 className="display display--lg">{city.lines[2]}</h1>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="city__footer">
            {showNext && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <PrimaryButton onClick={onNext}>{city.cta}</PrimaryButton>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
