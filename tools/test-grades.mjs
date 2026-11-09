import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'assets', 'source');

const tests = [
  {
    name: 'fountain-warm-desktop',
    src: 'fountain.jpg',
    w: 960,
    h: 540,
    pos: 'top',
    grade: { brightness: 0.9, saturation: 0.78, hue: 18 },
  },
  {
    name: 'fountain-warm-mobile',
    src: 'fountain.jpg',
    w: 480,
    h: 600,
    pos: 'centre',
    grade: { brightness: 0.9, saturation: 0.78, hue: 18 },
  },
  {
    name: 'palace-dusk-mobile',
    src: 'palace.jpg',
    w: 480,
    h: 600,
    pos: 'centre',
    grade: { brightness: 0.7, saturation: 0.5, hue: -14 },
  },
  {
    name: 'palace-dusk-desktop',
    src: 'palace.jpg',
    w: 960,
    h: 540,
    pos: 'centre',
    grade: { brightness: 0.7, saturation: 0.5, hue: -14 },
  },
];

for (const test of tests) {
  await sharp(path.join(SOURCE, test.src))
    .rotate()
    .resize(test.w, test.h, { fit: 'cover', position: test.pos })
    .modulate(test.grade)
    .jpeg({ quality: 86 })
    .toFile(path.join(__dirname, `${test.name}.jpg`));
}
console.log('tests written');
