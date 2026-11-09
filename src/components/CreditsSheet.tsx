import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import creditsData from '../config/credits.json';
import { invitation } from '../config/invitation';
import { EASE } from '../lib/motion';
import { IconButton } from './buttons/IconButton';

type Credit = {
  key: string;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  note: string;
};

type CreditsSheetProps = {
  open: boolean;
  onClose: () => void;
};

const credits = creditsData as Credit[];

export function CreditsSheet({ open, onClose }: CreditsSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusTimer = window.setTimeout(
      () => panelRef.current?.focus(),
      80,
    );
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="credits"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <div
            className="credits__backdrop"
            onClick={onClose}
            role="presentation"
          />
          <motion.div
            ref={panelRef}
            className="credits__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credits-title"
            tabIndex={-1}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <header className="credits__head">
              <div>
                <p className="eyebrow">Титры</p>
                <h2 id="credits-title">Фотографии Гомеля</h2>
              </div>
              <IconButton
                className="credits__close"
                label="Закрыть титры"
                onClick={onClose}
              >
                <X size={20} strokeWidth={1.6} />
              </IconButton>
            </header>

            <p className="credits__intro">
              Настоящие снимки Гомеля с Wikimedia Commons. Кадрирование и
              цветокоррекция выполнены для этого проекта.
            </p>

            <ul className="credits__list">
              {credits.map((credit) => (
                <li className="credit" key={credit.key}>
                  <div className="credit__text">
                    <p className="credit__title">
                      {invitation.photoLabels[credit.key] ?? credit.title}
                    </p>
                    <p className="credit__meta">
                      {credit.author} ·{' '}
                      <a
                        href={credit.licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {credit.license}
                      </a>
                    </p>
                  </div>
                  <a
                    className="credit__source"
                    href={credit.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Источник
                  </a>
                </li>
              ))}
            </ul>

            <div className="credits__notes">
              <p>
                Музыка — оригинальная инструментальная композиция, созданная
                для проекта.
              </p>
              <p>
                Изображения адаптированы и распространяются на условиях
                указанных лицензий. Код сайта лицензируется отдельно.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
