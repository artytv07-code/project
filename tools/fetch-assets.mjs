import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'source');
const USER_AGENT =
  'OdinOsobennyiVecher/1.0 (personal cinematic invitation; asset preparation)';

/**
 * Реальные фотографии Гомеля с Wikimedia Commons.
 * Метаданные проверяются через API и сохраняются в manifest.json.
 */
const ASSETS = [
  {
    key: 'bridge',
    title:
      'File:2026.06.05 Evening in Gomel Homieĺ Belarus Вечер в Гомеле Беларусь.jpg',
    alt: 'Вечерний мост через Сож в Гомеле, огни отражаются в воде',
    author: 'Igor Tkachiov',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    key: 'river',
    title:
      'File:2026.06.05 Evening an Sozh River in Gomel Homieĺ Belarus Вечер в Гомеле Беларусь.jpg',
    alt: 'Тихая вечерняя река Сож в Гомеле',
    author: 'Igor Tkachiov',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    key: 'sozh2',
    title: "File:Sozh in Gomel' 2.jpg",
    alt: 'Река Сож в Гомеле в синий час',
    author: 'Visem',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    key: 'embankment1',
    title: 'File:Nabiarežnaja Street in Homieĺ in night-time (1).jpg',
    alt: 'Вечерняя набережная Гомеля с тёплыми фонарями',
    author: 'Vasyatka1',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    key: 'embankment2',
    title: 'File:Nabiarežnaja Street in Homieĺ in night-time (2).jpg',
    alt: 'Мокрый асфальт набережной Гомеля в свете фонарей',
    author: 'Vasyatka1',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    key: 'lighthouse',
    title: 'File:Lighthouse Gomel, маяк-Гомель - panoramio.jpg',
    alt: 'Светящиеся фонари на вечерней улице Гомеля',
    author: 'cerber0',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    key: 'fountain',
    title: 'File:Gomel-circus-fontan-night.jpg',
    alt: 'Ночной фонтан и огни в центре Гомеля',
    author: 'Андрей Суслов',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  {
    key: 'palace',
    title: 'File:Palace of the Rumyantsevs and the Paskeviches in Gomel.jpg',
    alt: 'Дворец Румянцевых и Паскевичей в Гомеле',
    author: 'Andreenko99',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  {
    key: 'cafe',
    title: 'File:Zlaté cappuccino v A-Caffe v Gomelu.jpg',
    alt: 'Чашка капучино и круассан в тёплом свете гомельской кофейни',
    author: 'Ladabohac',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  {
    key: 'lenin',
    title: 'File:Gomel - Lenin Avenue.JPG',
    alt: 'Закатная перспектива улицы Ленина в Гомеле',
    author: 'Andrei Suslov',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
];

const API = 'https://commons.wikimedia.org/w/api.php';

function stripHtml(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extensionFor(contentType = '') {
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('avif')) return '.avif';
  return '.jpg';
}

async function fetchMetadata() {
  const params = new URLSearchParams({
    action: 'query',
    titles: ASSETS.map((asset) => asset.title).join('|'),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: '2400',
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${API}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Wikimedia API ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  const pages = Object.values(data?.query?.pages ?? {});
  const byTitle = new Map(pages.map((page) => [page.title, page]));
  return byTitle;
}

async function download(url, destination) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} for ${url}`);
  }
  const contentType = response.headers.get('content-type') ?? '';
  const filePath = destination + extensionFor(contentType);
  const file = createWriteStream(filePath);
  const body = response.body;
  if (!body) throw new Error(`Empty response for ${url}`);

  await new Promise((resolve, reject) => {
    body.pipeTo(
      new WritableStream({
        write(chunk) {
          file.write(Buffer.from(chunk));
        },
        close() {
          file.end(resolve);
        },
        abort(reason) {
          file.destroy();
          reject(reason);
        },
      }),
    ).catch(reject);
  });

  return { filePath, contentType };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log('→ Запрашиваю метаданные Wikimedia Commons…');
  const byTitle = await fetchMetadata();
  const manifest = [];

  for (const asset of ASSETS) {
    const page = byTitle.get(asset.title);
    if (!page || !page.imageinfo?.[0]) {
      throw new Error(`Не найдена страница Commons: ${asset.title}`);
    }

    const info = page.imageinfo[0];
    const meta = info.extmetadata ?? {};
    const author = stripHtml(meta.Artist?.value) || asset.author;
    const license = meta.LicenseShortName?.value || asset.license;
    const licenseUrl = meta.LicenseUrl?.value || asset.licenseUrl;
    const source = info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(asset.title)}`;
    const downloadUrl = (info.thumburl || info.url).replace(/\?utm_[^&]+(&utm_[^&]+)*$/, '');

    console.log(`→ Скачиваю ${asset.key}: ${asset.title}`);
    const { filePath, contentType } = await download(downloadUrl, path.join(OUT_DIR, asset.key));

    manifest.push({
      key: asset.key,
      title: asset.title,
      alt: asset.alt,
      author,
      license,
      licenseUrl,
      source,
      file: path.relative(ROOT, filePath).replaceAll('\\', '/'),
      contentType,
      width: info.width,
      height: info.height,
    });

    await sleep(250);
  }

  await writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );

  console.log(`\nГотово: ${manifest.length} файлов в assets/source.`);
  for (const item of manifest) {
    console.log(`  ${item.key.padEnd(12)} ${item.license.padEnd(12)} ${item.author}`);
  }
  const files = await readdir(OUT_DIR);
  console.log(`Файлов в каталоге: ${files.length}`);
}

main().catch((error) => {
  console.error('\nОшибка подготовки ассетов:', error);
  process.exitCode = 1;
});
