import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5173';

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Cormorant Garamond';
    font-style: normal;
    font-weight: 500;
    src: url('${BASE}/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-500-normal.woff2') format('woff2');
    unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
  }
  @font-face {
    font-family: 'Cormorant Garamond';
    font-style: normal;
    font-weight: 500;
    src: url('${BASE}/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Manrope';
    font-style: normal;
    font-weight: 600;
    src: url('${BASE}/node_modules/@fontsource/manrope/files/manrope-cyrillic-600-normal.woff2') format('woff2');
    unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
  }
  @font-face {
    font-family: 'Manrope';
    font-style: normal;
    font-weight: 600;
    src: url('${BASE}/node_modules/@fontsource/manrope/files/manrope-latin-600-normal.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: 'Manrope', sans-serif;
    color: #f5f0e7;
    background: #0c1422;
  }
  .card {
    position: relative;
    width: 1200px;
    height: 630px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 48px 72px 42px;
    text-align: center;
  }
  .card img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .scrim {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(8,13,23,0.82) 0%, rgba(8,13,23,0.2) 38%, rgba(8,13,23,0.3) 62%, rgba(8,13,23,0.9) 100%),
      radial-gradient(60% 45% at 50% 48%, rgba(230,168,92,0.12), transparent 72%);
  }
  .content { position: relative; z-index: 2; width: 100%; }
  .top { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .wordmark {
    margin: 0;
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 500;
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: #f5f0e7;
  }
  .label {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #d7b77d;
  }
  .center { display: flex; align-items: center; justify-content: center; flex: 1; }
  h1 {
    max-width: 850px;
    margin: 0;
    font-family: 'Cormorant Garamond', serif;
    font-size: 76px;
    font-weight: 500;
    line-height: 1.02;
    letter-spacing: -0.015em;
    text-shadow: 0 6px 40px rgba(0,0,0,0.55);
  }
  .bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .tagline {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #d7b77d;
  }
  .place {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(245,240,231,0.62);
  }
</style>
</head>
<body>
  <div class="card">
    <img src="${BASE}/images/bridge-desktop-1920.avif" alt="" />
    <div class="scrim"></div>
    <div class="content top">
      <p class="wordmark">Один особенный вечер</p>
      <p class="label">Небольшая история</p>
    </div>
    <div class="content center">
      <h1>У каждого вечера есть своя атмосфера…</h1>
    </div>
    <div class="content bottom">
      <p class="tagline">Гомель · Среда · Вечер</p>
      <p class="place">Приглашение на прогулку</p>
    </div>
  </div>
</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  const img = document.querySelector('img');
  if (img && !img.complete) {
    await new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }
});
await page.screenshot({
  path: path.join(ROOT, 'public', 'og-image.jpg'),
  type: 'jpeg',
  quality: 92,
});
await browser.close();
console.log('OG image written');
