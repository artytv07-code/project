import type { ImageKey, ImageVariant } from '../data/images';
import { getImage } from '../data/images';

type ResponsiveImageProps = {
  image: ImageKey;
  variant?: ImageVariant;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  alt?: string;
  priority?: boolean;
  onLoad?: () => void;
};

/**
 * <picture> с AVIF → WebP → fallback и разными кропами для телефона
 * и десктопа. Браузер скачивает только один подходящий вариант.
 */
export function ResponsiveImage({
  image,
  variant = 'desktop',
  sizes = '100vw',
  className,
  imgClassName,
  alt,
  priority = false,
  onLoad,
}: ResponsiveImageProps) {
  const entry = getImage(image);
  const { mobile, desktop, detail } = entry;
  const primary =
    variant === 'detail' ? detail : variant === 'mobile' ? mobile : desktop;
  const fallback = primary ?? desktop ?? mobile ?? detail;

  if (!fallback) return null;

  const commonImg = {
    className: imgClassName,
    src: fallback.fallback,
    alt: alt ?? entry.alt,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    fetchPriority: priority ? ('high' as const) : ('auto' as const),
    decoding: 'async' as const,
    onLoad,
  };

  if (variant === 'detail') {
    return (
      <picture className={className}>
        {detail && (
          <>
            <source type="image/avif" srcSet={detail.avif} sizes={sizes} />
            <source type="image/webp" srcSet={detail.webp} sizes={sizes} />
          </>
        )}
        <img {...commonImg} />
      </picture>
    );
  }

  return (
    <picture className={className}>
      {variant === 'desktop' && mobile && (
        <>
          <source
            media="(max-width: 767px)"
            type="image/avif"
            srcSet={mobile.avif}
            sizes={sizes}
          />
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet={mobile.webp}
            sizes={sizes}
          />
        </>
      )}
      {variant === 'mobile'
        ? mobile && (
            <>
              <source type="image/avif" srcSet={mobile.avif} sizes={sizes} />
              <source type="image/webp" srcSet={mobile.webp} sizes={sizes} />
            </>
          )
        : desktop && (
            <>
              <source type="image/avif" srcSet={desktop.avif} sizes={sizes} />
              <source type="image/webp" srcSet={desktop.webp} sizes={sizes} />
            </>
          )}
      <img {...commonImg} />
    </picture>
  );
}
