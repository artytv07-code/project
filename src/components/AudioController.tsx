import { Volume2, VolumeX } from 'lucide-react';
import { IconButton } from './buttons/IconButton';

type AudioControllerProps = {
  enabled: boolean;
  available: boolean;
  visible: boolean;
  onToggle: () => void;
};

export function AudioController({
  enabled,
  available,
  visible,
  onToggle,
}: AudioControllerProps) {
  if (!available || !visible) return null;

  return (
    <IconButton
      className="audio-control"
      label={enabled ? 'Выключить музыку' : 'Включить музыку'}
      aria-pressed={enabled}
      onClick={onToggle}
    >
      {enabled ? (
        <Volume2 size={20} strokeWidth={1.6} />
      ) : (
        <VolumeX size={20} strokeWidth={1.6} />
      )}
    </IconButton>
  );
}
