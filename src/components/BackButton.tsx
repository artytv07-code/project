import { ArrowLeft } from 'lucide-react';
import { IconButton } from './buttons/IconButton';

type BackButtonProps = {
  visible: boolean;
  onClick: () => void;
};

export function BackButton({ visible, onClick }: BackButtonProps) {
  if (!visible) return null;

  return (
    <IconButton className="back-button" label="Назад" onClick={onClick}>
      <ArrowLeft size={20} strokeWidth={1.6} />
    </IconButton>
  );
}
