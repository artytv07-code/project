import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'source');
const IMAGE_DIR = path.join(ROOT, 'public', 'images');
const CONFIG_DIR = path.join(ROOT, 'src', 'config');
const PUBLIC_DIR = path.join(ROOT, 'public');

const ASSETS = [
  {
    key: 'bridge',
    variants: ['mobile', 'desktop'],
    position: 'centre',
    grade: { brightness: 0.95, saturation: 0.9 },
    detail: false,
  },
  {
    key: 'river',
    variants: ['mobile', 'desktop'],
    position: 'centre',
    grade: { brightness: 0.96, saturation: 0.88 },
    detail: true,
  },
  {
    key: 'embankment1',
    variants: ['mobile', 'desktop'],
    position: 'centre',
    grade: { brightness: 0.92, saturation: 0.9 },
    detail: false,
  },
  {
    key: 'embankment2',
    variants: ['mobile', 'desktop'],
    position: 'centre',
    grade: { brightness: 0.94, saturation: 0.9 },
    detail: true,
  },
  {
    key: 'lighthouse',
    variants: [],
    position: 'centre',
    grade: { brightness: 0.95, saturation: 0.88 },
    detail: true,
  },
  {
    key: 'fountain',
    // Фонтан остаётся камерной деталью вечера, а не фоном финала.
    variants: [],
    position: 'centre',
    grade: { brightness: 0.88, saturation: 0.82, hue: 8 },
    detail: true,
  },
  {
    key: 'palace',
    variants: ['mobile', 'desktop'],
    position: 'centre',
    grade: { brightness: 0.8, saturation: 0.62, hue: -10 },
    detail: false,
  },
  {
    key: 'lenin',
    variants: ['mobile', 'desktop'],
    position: 'centre',
    grade: { brightness: 0.9, saturation: 0.84, hue: -4 },
    detail: false,
  },
  {
    key: 'cafe',
    variants: [],
    position: 'centre',
    grade: { brightness: 1.02, saturation: 1.06 },
    detail: true,
  },
];

const VARIANTS = {
  // Мобильный фон — вертикальный кадр: меньше обрезки на iPhone.
  mobile: {
    widths: [480, 720, 1080],
    ratio: 4 / 5,
    quality: { avif: 56, webp: 78 },
  },
  // Десктопный фон — широкий кинематографичный кадр.
  desktop: {
    widths: [960, 1280, 1920],
    ratio: 16 / 9,
    quality: { avif: 54, webp: 77 },
  },
  // Зарисовки в сцене деталей — вертикальные «кадры плёнки».
  detail: {
    widths: [450, 600, 900],
    ratio: 4 / 5,
    quality: { avif: 60, webp: 80 },
  },
};

// ratio задаётся как ширина / высота.
function sizeFor(width, ratio) {
  return { width, height: Math.round(width / ratio) };
}

async function findSource(key) {
  const files = await readdir(SOURCE_DIR);
  const match = files.find((file) => file.startsWith(`${key}.`));
  if (!match) throw new Error(`Не найден исходник для ${key} в assets/source`);
  return path.join(SOURCE_DIR, match);
}

function srcSet(paths) {
  return paths.map(({ file, width }) => `/images/${file} ${width}w`).join(', ');
}

async function makeLqip(source, ratio, position) {
  const { width, height } = sizeFor(24, ratio);
  const buffer = await sharp(source)
    .rotate()
    .resize(width, height, { fit: 'cover', position })
    .webp({ quality: 32 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

async function processVariant(source, asset, variantName, variant) {
  const outputs = { avif: [], webp: [] };

  for (const width of variant.widths) {
    const { height } = sizeFor(width, variant.ratio);
    const position =
      variantName === 'desktop'
        ? asset.positionDesktop ?? asset.position ?? 'centre'
        : asset.position ?? 'centre';

    let pipeline = sharp(source)
      .rotate()
      .resize(width, height, {
        fit: 'cover',
        position,
      });

    if (asset.grade) {
      pipeline = pipeline.modulate(asset.grade);
    }

    const baseName = `${asset.key}-${variantName}-${width}`;
    const avifFile = `${baseName}.avif`;
    const webpFile = `${baseName}.webp`;

    await pipeline
      .clone()
      .avif({ quality: variant.quality.avif, effort: 4 })
      .toFile(path.join(IMAGE_DIR, avifFile));
    await pipeline
      .clone()
      .webp({ quality: variant.quality.webp, effort: 5, smartSubsample: true })
      .toFile(path.join(IMAGE_DIR, webpFile));

    outputs.avif.push({ file: avifFile, width });
    outputs.webp.push({ file: webpFile, width });
  }

  return {
    avif: srcSet(outputs.avif),
    webp: srcSet(outputs.webp),
    fallback: `/images/${outputs.webp.at(-1).file}`,
    width: variant.widths.at(-1),
    height: sizeFor(variant.widths.at(-1), variant.ratio).height,
  };
}

async function generateGrain() {
  const size = 256;
  const buffer = Buffer.alloc(size * size * 3);
  for (let i = 0; i < buffer.length; i += 1) {
    const value = 96 + Math.floor(Math.random() * 64);
    buffer[i] = value;
  }
  await sharp(buffer, { raw: { width: size, height: size, channels: 3 } })
    .webp({ quality: 55 })
    .toFile(path.join(IMAGE_DIR, 'grain.webp'));
}

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="90%">
      <stop offset="0" stop-color="#1c2740"/>
      <stop offset="1" stop-color="#0c1422"/>
    </radialGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="196" fill="none" stroke="#D7B77D" stroke-opacity=".28" stroke-width="2"/>
  <g filter="url(#glow)" transform="translate(64 70) scale(16)">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      fill="none" stroke="#D7B77D" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <circle cx="256" cy="430" r="4" fill="#E6A85C" opacity=".8"/>
</svg>`;

async function generateFavicons() {
  await writeFile(path.join(PUBLIC_DIR, 'favicon.svg'), FAVICON_SVG, 'utf8');
  const svg = Buffer.from(FAVICON_SVG);
  await sharp(svg).resize(180, 180).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  await sharp(svg).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
}

async function generateOgPlaceholder(source) {
  const base = await sharp(source)
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.78, saturation: 0.82 })
    .toBuffer();

  const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0c1422" stop-opacity=".42"/>
        <stop offset=".55" stop-color="#0c1422" stop-opacity=".22"/>
        <stop offset="1" stop-color="#0c1422" stop-opacity=".92"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <line x1="80" y1="424" x2="200" y2="424" stroke="#D7B77D" stroke-width="2"/>
    <text x="80" y="500" font-family="Georgia, serif" font-size="72" fill="#F5F0E7">Один особенный вечер</text>
    <text x="82" y="552" font-family="Arial, sans-serif" font-size="20" letter-spacing="7" fill="#D7B77D">ГОМЕЛЬ · СРЕДА · ВЕЧЕР</text>
  </svg>`);

  await sharp(base)
    .composite([{ input: overlay, blend: 'over' }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(PUBLIC_DIR, 'og-image.jpg'));
}

async function main() {
  await rm(IMAGE_DIR, { recursive: true, force: true });
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(CONFIG_DIR, { recursive: true });

  const sourceManifest = JSON.parse(
    await readFile(path.join(SOURCE_DIR, 'manifest.json'), 'utf8'),
  );
  const sourceByKey = new Map(sourceManifest.map((item) => [item.key, item]));

  const generated = {};
  const credits = [];
  let totalBytes = 0;

  for (const asset of ASSETS) {
    const source = await findSource(asset.key);
    const info = sourceByKey.get(asset.key);
    if (!info) throw new Error(`Нет метаданных для ${asset.key}`);

    console.log(`→ Обрабатываю ${asset.key}`);
    const entry = {
      alt: info.alt,
      author: info.author,
      license: info.license,
      licenseUrl: info.licenseUrl,
      source: info.source,
      lqip: '',
    };

    const lqipRatio = asset.detail ? VARIANTS.detail.ratio : VARIANTS.mobile.ratio;
    entry.lqip = await makeLqip(source, lqipRatio, asset.position ?? 'centre');

    for (const variantName of asset.variants) {
      const variant = VARIANTS[variantName];
      entry[variantName] = await processVariant(source, asset, variantName, variant);
    }

    if (asset.detail) {
      entry.detail = await processVariant(source, asset, 'detail', VARIANTS.detail);
    }

    generated[asset.key] = entry;
    credits.push({
      key: asset.key,
      title: info.title.replace(/^File:/, '').replace(/\.(jpg|jpeg|png|webp)$/i, ''),
      author: info.author,
      license: info.license,
      licenseUrl: info.licenseUrl,
      source: info.source,
      note: 'Кадрирование и цветокоррекция для проекта',
    });
  }

  await writeFile(
    path.join(CONFIG_DIR, 'generated-images.json'),
    JSON.stringify(generated, null, 2),
    'utf8',
  );
  await writeFile(
    path.join(CONFIG_DIR, 'credits.json'),
    JSON.stringify(credits, null, 2),
    'utf8',
  );

  console.log('→ Генерирую зерно и иконки');
  await generateGrain();
  await generateFavicons();

  const bridgeSource = await findSource('bridge');
  await generateOgPlaceholder(bridgeSource);

  const files = await readdir(IMAGE_DIR);
  for (const file of files) {
    const stats = await readFile(path.join(IMAGE_DIR, file));
    totalBytes += stats.byteLength;
  }

  console.log(`\nГотово. Файлов изображений: ${files.length}`);
  console.log(`Суммарный вес public/images: ${(totalBytes / 1024 / 1024).toFixed(2)} МБ`);
}

main().catch((error) => {
  console.error('\nОшибка обработки изображений:', error);
  process.exitCode = 1;
});
