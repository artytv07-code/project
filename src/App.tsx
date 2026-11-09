import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioController } from './components/AudioController';
import { BackButton } from './components/BackButton';
import { CreditsSheet } from './components/CreditsSheet';
import { ProgressIndicator } from './components/ProgressIndicator';
import { SceneTransition } from './components/SceneTransition';
import { CityScene } from './components/scenes/CityScene';
import { DetailsPanel } from './components/scenes/DetailsPanel';
import { DetailsScene } from './components/scenes/DetailsScene';
import { FinalScene } from './components/scenes/FinalScene';
import { IntroScene } from './components/scenes/IntroScene';
import { IntrigueScene } from './components/scenes/IntrigueScene';
import { InvitationScene } from './components/scenes/InvitationScene';
import { invitation } from './config/invitation';
import {
  prefetchImage,
  type ImageKey,
  type ImageVariant,
} from './data/images';
import { useAppHeight } from './hooks/useAppHeight';
import { useAudio } from './hooks/useAudio';

type SceneId =
  | 'intro'
  | 'city'
  | 'details'
  | 'intrigue'
  | 'invitation'
  | 'panel'
  | 'final';

const SCENE_TITLES: Record<SceneId, string> = {
  intro: 'Тихий вечер',
  city: 'Город просыпается вечером',
  details: 'Маленькие детали большого вечера',
  intrigue: 'Кажется, я кое-что задумал',
  invitation: 'Один вопрос',
  panel: 'Вот что я предлагаю',
  final: 'Тогда до среды?',
};

const BACK_TARGET: Partial<Record<SceneId, SceneId>> = {
  city: 'intro',
  details: 'city',
  intrigue: 'details',
  invitation: 'intrigue',
  panel: 'invitation',
};

const PROGRESS: Record<SceneId, number> = {
  intro: 0,
  city: 1,
  details: 2,
  intrigue: 3,
  invitation: 4,
  panel: 4,
  final: 5,
};

type PrefetchGroup = {
  keys: ImageKey[];
  detail?: boolean;
};

const PREFETCH: Record<SceneId, PrefetchGroup[]> = {
  intro: [{ keys: invitation.assets.city }],
  city: [{ keys: invitation.texts.details.frames.map((frame) => frame.image), detail: true }],
  details: [{ keys: [invitation.assets.intrigue] }],
  intrigue: [{ keys: [invitation.assets.invitation] }],
  invitation: [
    { keys: [invitation.assets.panel] },
    { keys: [invitation.assets.final] },
  ],
  panel: [{ keys: [invitation.assets.final] }],
  final: [],
};

function App() {
  const [scene, setScene] = useState<SceneId>('intro');
  const [direction, setDirection] = useState(1);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const lockRef = useRef(false);
  const lockTimer = useRef<number | null>(null);

  const {
    enabled: audioEnabled,
    available: audioAvailable,
    start: startAudio,
    toggle: toggleAudio,
    stop: stopAudio,
  } = useAudio(invitation.audio);

  useAppHeight();

  // Только для локальной проверки: ?scene=invitation открывает нужный экран.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const requested = new URLSearchParams(window.location.search).get('scene');
    if (requested && requested in SCENE_TITLES) {
      setScene(requested as SceneId);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (lockTimer.current !== null) window.clearTimeout(lockTimer.current);
    };
  }, []);

  const navigate = useCallback(
    (next: SceneId, nextDirection: number) => {
      if (lockRef.current || next === scene) return;

      lockRef.current = true;
      setDirection(nextDirection);
      setScene(next);

      if (lockTimer.current !== null) window.clearTimeout(lockTimer.current);
      lockTimer.current = window.setTimeout(() => {
        lockRef.current = false;
      }, 1000);
    },
    [scene],
  );

  const handleStart = useCallback(() => {
    void startAudio();
    navigate('city', 1);
  }, [navigate, startAudio]);

  const handleRestart = useCallback(() => {
    stopAudio();
    setCreditsOpen(false);
    navigate('intro', -1);
  }, [navigate, stopAudio]);

  const handleBack = useCallback(() => {
    const target = BACK_TARGET[scene];
    if (target) navigate(target, -1);
  }, [navigate, scene]);

  const handleOpenCredits = useCallback(() => setCreditsOpen(true), []);
  const handleCloseCredits = useCallback(() => setCreditsOpen(false), []);

  useEffect(() => {
    const groups = PREFETCH[scene];
    if (groups.length === 0) return;

    const timer = window.setTimeout(() => {
      const backgroundVariant: ImageVariant = window.matchMedia(
        '(max-width: 767px)',
      ).matches
        ? 'mobile'
        : 'desktop';

      for (const group of groups) {
        const variant: ImageVariant = group.detail
          ? 'detail'
          : backgroundVariant;
        for (const key of group.keys) prefetchImage(key, variant);
      }
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [scene]);

  const renderScene = () => {
    switch (scene) {
      case 'intro':
        return <IntroScene onNext={handleStart} />;
      case 'city':
        return <CityScene onNext={() => navigate('details', 1)} />;
      case 'details':
        return <DetailsScene onNext={() => navigate('intrigue', 1)} />;
      case 'intrigue':
        return <IntrigueScene onNext={() => navigate('invitation', 1)} />;
      case 'invitation':
        return (
          <InvitationScene
            onAccept={() => navigate('final', 1)}
            onDetails={() => navigate('panel', 1)}
          />
        );
      case 'panel':
        return (
          <DetailsPanel
            onAccept={() => navigate('final', 1)}
            onCredits={handleOpenCredits}
          />
        );
      case 'final':
        return (
          <FinalScene
            onRestart={handleRestart}
            onCredits={handleOpenCredits}
          />
        );
      default:
        return null;
    }
  };

  const showChrome = scene !== 'intro';
  const backTarget = BACK_TARGET[scene];

  return (
    <div className="app">
      <div className="app__vignette" aria-hidden="true" />
      <div className="app__grain" aria-hidden="true" />

      <header className="chrome">
        <BackButton visible={Boolean(backTarget)} onClick={handleBack} />
        <ProgressIndicator
          current={PROGRESS[scene]}
          visible={showChrome}
        />
        <AudioController
          enabled={audioEnabled}
          available={audioAvailable}
          visible={showChrome}
          onToggle={() => {
            void toggleAudio();
          }}
        />
      </header>

      <main className="app__stage">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <SceneTransition key={scene} direction={direction}>
            {renderScene()}
          </SceneTransition>
        </AnimatePresence>
      </main>

      <CreditsSheet open={creditsOpen} onClose={handleCloseCredits} />

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {SCENE_TITLES[scene]}
      </p>
    </div>
  );
}

export default App;
