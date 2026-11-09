import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMAGES = path.join(ROOT, 'public', 'images');

const mobile = ['bridge', 'river', 'embankment1', 'fountain', 'palace', 'lenin'];
const detail = ['cafe', 'embankment2', 'lighthouse', 'river'];

async function sheet(names, variant, suffix, width, height, out) {
  const cellW = 260;
  const cellH = 340;
  const gap = 12;
  const cols = 3;
  const rows = Math.ceil(names.length / cols);
  const sheetW = cols * cellW + (cols + 1) * gap;
  const sheetH = rows * cellH + (rows + 1) * gap;
  const composites = [];

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    const source = path.join(IMAGES, `${name}-${variant}-${suffix}.avif`);
    const img = await sharp(source)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 82 })
      .toBuffer();
    const x = gap + (i % cols) * (cellW + gap);
    const y = gap + Math.floor(i / cols) * (cellH + gap);
    composites.push({ input: img, left: x, top: y });
    const label = Buffer.from(
      `<svg width="${cellW}" height="28"><text x="0" y="19" font-family="Arial" font-size="15" fill="#ffffff">${name}</text></svg>`,
    );
    composites.push({ input: label, left: x, top: y + height + 6 });
  }

  await sharp({
    create: { width: sheetW, height: sheetH, channels: 3, background: '#111820' },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(path.join(ROOT, out));
}

await sheet(mobile, 'mobile', 720, 260, 300, 'tools/preview-mobile.jpg');
await sheet(detail, 'detail', 600, 260, 300, 'tools/preview-details.jpg');
await sheet(mobile, 'desktop', 1280, 320, 180, 'tools/preview-desktop.jpg');
console.log('preview sheets written');
