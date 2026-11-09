import generated from '../config/generated-images.json';

export type ImageSet = {
  avif: string;
  webp: string;
  fallback: string;
  width: number;
  height: number;
};

export type ImageEntry = {
  alt: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  lqip: string;
  mobile?: ImageSet;
  desktop?: ImageSet;
  detail?: ImageSet;
};

export type ImageKey = keyof typeof generated;
export type ImageVariant = 'mobile' | 'desktop' | 'detail';

const imageData = generated as Record<ImageKey, ImageEntry>;

export function getImage(key: ImageKey): ImageEntry {
  return imageData[key];
}

export function getImageSet(key: ImageKey, variant: ImageVariant): ImageSet {
  const entry = getImage(key);
  const set = entry[variant] ?? entry.desktop ?? entry.mobile ?? entry.detail;
  if (!set) {
    throw new Error(`Для изображения «${key}» нет варианта «${variant}»`);
  }
  return set;
}

/** Предзагрузка только следующей сцены, а не всех изображений сразу. */
export function prefetchImage(key: ImageKey, variant: ImageVariant): void {
  if (typeof window === 'undefined') return;
  const set = getImageSet(key, variant);
  const candidate =
    set.avif
      .split(',')
      .map((item) => item.trim())
      .find(Boolean)
      ?.split(' ')[0] ?? set.fallback;
  const image = new Image();
  image.decoding = 'async';
  image.src = candidate;
}
