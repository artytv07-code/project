import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'tools', 'shots');
const BASE = 'http://127.0.0.1:5173';

const CHROME =
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const results = [];
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickText(page, selector, text) {
  const clicked = await page.evaluate(
    (sel, label) => {
      const nodes = [...document.querySelectorAll(sel)];
      const node = nodes.find((item) =>
        item.textContent?.replace(/\s+/g, ' ').trim().includes(label),
      );
      if (!node) return false;
      node.click();
      return true;
    },
    selector,
    text,
  );
  if (!clicked) throw new Error(`Не найдено «${text}» (${selector})`);
}

async function waitText(page, text, timeout = 15000) {
  await page.waitForFunction(
    (label) => document.body.innerText.toLowerCase().includes(label.toLowerCase()),
    { timeout },
    text,
  );
}

async function shot(page, name) {
  await page.screenshot({
    path: path.join(SHOTS, `${name}.png`),
    fullPage: false,
  });
}

async function collectLayout(page, scene, width, height) {
  const data = await page.evaluate((sceneName) => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) > 0.01 &&
        rect.width > 1 &&
        rect.height > 1
      );
    };

    const overflows = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue;
      if (el.closest('.scene-bg, .particles, .city__backgrounds, .app__grain, .app__vignette')) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      if (rect.left < -1 || rect.right > innerWidth + 1) {
        overflows.push({
          tag: el.tagName,
          cls: typeof el.className === 'string' ? el.className.slice(0, 80) : '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          text: el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40),
        });
      }
    }

    const smallTargets = [...document.querySelectorAll('button, a.btn, a.text-btn')]
      .filter(visible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        };
      })
      .filter((item) => item.w < 44 || item.h < 44);

    const scroll = document.querySelector('.scene__scroll');
    return {
      scene: sceneName,
      innerWidth,
      innerHeight,
      docScrollWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      overflows: overflows.slice(0, 12),
      smallTargets,
      scrollHeight: scroll?.scrollHeight ?? 0,
      clientHeight: scroll?.clientHeight ?? 0,
      verticalScroll: scroll ? scroll.scrollHeight > scroll.clientHeight + 2 : false,
    };
  }, scene);

  results.push({ width, height, ...data });
}

async function newPage(browser, width, height, mobile = true) {
  const page = await browser.newPage();
  await page.setViewport({
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'no-preference' },
  ]);
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText,
    });
  });
  return page;
}

async function openScene(page, scene) {
  await page.goto(`${BASE}/?scene=${scene}`, { waitUntil: 'networkidle2' });
  await wait(1400);
}

async function fullFlow(page) {
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await waitText(page, 'Посмотреть, что дальше');
  await wait(900);
  await shot(page, '390-intro');

  await clickText(page, 'button', 'Посмотреть, что дальше');
  await wait(900);
  await shot(page, '390-city-whisper');
  await wait(2600);
  await shot(page, '390-city-headline');
  await wait(3400);
  await shot(page, '390-city-last');
  await waitText(page, 'Дальше', 8000);
  await wait(700);
  await shot(page, '390-city-cta');

  await clickText(page, 'button', 'Дальше');
  await waitText(page, 'Пропустить');
  await wait(800);
  await shot(page, '390-details-1');
  await clickText(page, 'button', 'Пропустить');
  await wait(1000);
  await shot(page, '390-details-end');
  await clickText(page, 'button', 'Продолжить');

  await waitText(page, 'Вообще-то…');
  await wait(700);
  await shot(page, '390-intrigue-1');
  await waitText(page, 'Кажется, я догадываюсь…', 10000);
  await wait(600);
  await shot(page, '390-intrigue-cta');
  await clickText(page, 'button', 'Кажется, я догадываюсь…');

  await waitText(page, 'Как насчёт вечерней прогулки?');
  await wait(1800);
  await shot(page, '390-invitation');
  await clickText(page, 'button', 'Расскажи подробнее');

  await waitText(page, 'Вечер без строгого плана');
  await wait(1000);
  await shot(page, '390-panel');
  await page.evaluate(() =>
    document.querySelector('.panel__actions')?.scrollIntoView({ block: 'end' }),
  );
  await wait(700);
  await shot(page, '390-panel-actions');
  await clickText(page, 'button', 'Фотографии Гомеля');
  await wait(700);
  await shot(page, '390-credits');
  await page.keyboard.press('Escape');
  await wait(600);
  await clickText(page, 'button', 'Мне нравится эта идея');
  await waitText(page, 'Тогда договорились');
  await wait(3000);
  await shot(page, '390-final');

  await clickText(page, 'button', 'Посмотреть ещё раз');
  await waitText(page, 'Посмотреть, что дальше');
  await wait(900);
  await shot(page, '390-restart-intro');
}

async function acceptBranch(page) {
  await page.goto(`${BASE}/?scene=invitation`, { waitUntil: 'networkidle2' });
  await wait(1900);
  await clickText(page, 'button', 'С удовольствием');
  await waitText(page, 'Тогда договорились');
  await wait(3000);
  await shot(page, '390-final-accept');
}

async function backChain(page) {
  await openScene(page, 'invitation');
  await page.click('button[aria-label="Назад"]');
  await wait(1200);
  await shot(page, '390-back-intrigue');
  await page.click('button[aria-label="Назад"]');
  await wait(1200);
  await shot(page, '390-back-details');
  await page.click('button[aria-label="Назад"]');
  await wait(1200);
  await shot(page, '390-back-city');
}

const SCENES = ['intro', 'city', 'details', 'intrigue', 'invitation', 'panel', 'final'];
const WIDTHS = [
  { w: 320, h: 568 },
  { w: 360, h: 800 },
  { w: 375, h: 812 },
  { w: 390, h: 844 },
  { w: 393, h: 852 },
  { w: 402, h: 874 },
  { w: 430, h: 932 },
];

async function main() {
  await mkdir(SHOTS, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
  });

  try {
    const flowPage = await newPage(browser, 390, 844);
    await fullFlow(flowPage);
    await acceptBranch(flowPage);
    await backChain(flowPage);
    await flowPage.close();

    for (const { w, h } of WIDTHS) {
      const page = await newPage(browser, w, h);
      for (const scene of SCENES) {
        await openScene(page, scene);
        await collectLayout(page, scene, w, h);
        if ([320, 390, 430].includes(w)) {
          await shot(page, `${w}-${scene}`);
        }
      }
      await page.close();
    }

    const desktop = await newPage(browser, 1440, 900, false);
    for (const scene of SCENES) {
      await openScene(desktop, scene);
      await collectLayout(desktop, scene, 1440, 900);
      await shot(desktop, `desktop-${scene}`);
    }
    await desktop.close();
  } catch (error) {
    pageErrors.push(`Сценарий прерван: ${String(error)}`);
    throw error;
  } finally {
    await browser.close();
    await writeFile(
      path.join(SHOTS, 'report.json'),
      JSON.stringify(
        { results, consoleErrors, pageErrors, failedRequests },
        null,
        2,
      ),
      'utf8',
    );
  }

  const problems = results.filter(
    (item) =>
      item.horizontalOverflow ||
      item.overflows.length > 0 ||
      item.smallTargets.length > 0,
  );

  console.log(`Проверено экранов: ${results.length}`);
  console.log(`Снимков: см. tools/shots`);
  console.log(`Ошибки консоли: ${consoleErrors.length}`);
  console.log(`Ошибки страницы: ${pageErrors.length}`);
  console.log(`Неудачные запросы: ${failedRequests.length}`);
  console.log(`Проблемы вёрстки: ${problems.length}`);
  for (const problem of problems) {
    console.log(
      `- ${problem.width}px ${problem.scene}: overflow=${problem.horizontalOverflow}, elements=${problem.overflows.length}, small=${problem.smallTargets.length}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
