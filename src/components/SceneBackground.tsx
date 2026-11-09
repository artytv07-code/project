import { useState } from 'react';
import {
  getImage,
  type ImageKey,
  type ImageVariant,
} from '../data/images';
import { ResponsiveImage } from './ResponsiveImage';

type Tone = 'default' | 'intro' | 'city' | 'dusk' | 'deep' | 'warm' | 'detail';

type SceneBackgroundProps = {
  image: ImageKey;
  variant?: ImageVariant;
  tone?: Tone;
  priority?: boolean;
  zoom?: boolean;
  blurred?: boolean;
  scrim?: boolean;
  className?: string;
};

export function SceneBackground({
  image,
  variant = 'desktop',
  tone = 'default',
  priority = false,
  zoom = false,
  blurred = false,
  scrim = true,
  className = '',
}: SceneBackgroundProps) {
  const entry = getImage(image);
  const [loaded, setLoaded] = useState(false);

  const classes = [
    'scene-bg',
    tone !== 'default' ? `scene-bg--${tone}` : '',
    zoom ? 'scene-bg--zoom' : '',
    blurred ? 'scene-bg--blurred' : '',
    loaded ? 'is-loaded' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={{ backgroundImage: `url(${entry.lqip})` }}
      aria-hidden="true"
    >
      <ResponsiveImage
        image={image}
        variant={variant}
        sizes="100vw"
        imgClassName="scene-bg__img"
        alt=""
        priority={priority}
        onLoad={() => setLoaded(true)}
      />
      {scrim && <div className="scene-bg__scrim" />}
    </div>
  );
}
