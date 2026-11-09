import { useEffect, useRef } from 'react';

type AmbientParticlesProps = {
  density?: number;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  phase: number;
};

/**
 * Лёгкие золотистые частицы на canvas. DPR ограничен, анимация
 * останавливается в неактивной вкладке и упрощается при reduced motion.
 */
export function AmbientParticles({
  density = 28,
  className = '',
}: AmbientParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let last = performance.now();
    let particles: Particle[] = [];

    const sprite = document.createElement('canvas');
    sprite.width = 64;
    sprite.height = 64;
    const spriteContext = sprite.getContext('2d');
    if (!spriteContext) return;

    const glow = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, 'rgba(255, 232, 190, 1)');
    glow.addColorStop(0.32, 'rgba(230, 168, 92, 0.55)');
    glow.addColorStop(1, 'rgba(230, 168, 92, 0)');
    spriteContext.fillStyle = glow;
    spriteContext.fillRect(0, 0, 64, 64);

    const createParticles = () => {
      const isDesktop = window.innerWidth >= 768;
      const count = reduce
        ? 8
        : isDesktop
          ? Math.min(60, Math.round(density * 1.7))
          : density;

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.7 + Math.random() * 1.8,
        speed: 3 + Math.random() * 10,
        drift: 1 + Math.random() * 5,
        alpha: 0.12 + Math.random() * 0.34,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      for (const particle of particles) {
        const twinkle = 0.62 + 0.38 * Math.sin(now / 1400 + particle.phase);
        context.globalAlpha = particle.alpha * twinkle;
        const size = particle.size * 8;
        context.drawImage(
          sprite,
          particle.x - size / 2,
          particle.y - size / 2,
          size,
          size,
        );
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
    };

    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;

      for (const particle of particles) {
        particle.y -= particle.speed * delta;
        particle.x +=
          Math.sin(now / 2600 + particle.phase) * particle.drift * delta;

        if (particle.y < -12) {
          particle.y = height + 12;
          particle.x = Math.random() * width;
        }
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
      }

      draw(now);
      frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        createParticles();
      } else {
        for (const particle of particles) {
          particle.x = Math.min(particle.x, width);
          particle.y = Math.min(particle.y, height);
        }
      }

      if (reduce) draw(performance.now());
    };

    const start = () => {
      if (frame !== 0 || reduce) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`particles ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
