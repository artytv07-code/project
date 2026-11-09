# Один особенный вечер

Кинематографичное приглашение на вечернюю прогулку по Гомелю.
Одностраничное приложение без бэкенда: React 19 + TypeScript + Vite, все ресурсы локальные.

## Локальный запуск

```bash
npm ci
npm run dev        # http://localhost:5173
```

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер Vite |
| `npm run build` | проверка типов (`tsc --noEmit`) + production-сборка в `dist/` |
| `npm run preview` | локальный просмотр собранного `dist/` |
| `npm run typecheck` | только проверка типов |

Ассеты (`npm run assets`, `npm run music`, `npm run og`) пересобираются скриптами в `tools/`
и уже лежат в `public/` — для сборки сайта они не нужны.

## Переменные окружения

Единственная переменная — `VITE_SITE_URL`: абсолютный адрес сайта для `canonical`
и Open Graph (`index.html`). Значение вшивается **на этапе сборки**, поэтому после
смены домена нужен redeploy.

В репозитории есть `.env` со значением-заглушкой `https://example.com`. При сборке
на Render переменная окружения сервиса имеет приоритет над `.env`, так что менять
файл не нужно — задавайте адрес в Render.

## Деплой на Render

Проект описан Blueprint-файлом `render.yaml`: Static Site, сборка `npm ci --include=dev && npm run build`,
публикация `./dist`, Node 24.22.1, долгий кэш для `/assets/*`.

### Через Blueprint (рекомендуется)

1. Запушьте `render.yaml` в GitHub-репозиторий (ветка `main`).
2. Откройте [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
3. Подключите GitHub и выберите репозиторий `artytv07-code/project`.
4. Проверьте имя сервиса и значение `VITE_SITE_URL`, подтвердите создание.

Render собирает сайт и выдаёт адрес `https://<имя>.onrender.com`. Дальше каждый пуш
в `main` пересобирает сайт автоматически.

### Вручную (без Blueprint)

1. **New** → **Static Site** → тот же репозиторий, ветка `main`.
2. Build Command: `npm ci --include=dev && npm run build`
3. Publish Directory: `dist`
4. В **Environment** добавьте `VITE_SITE_URL` = выданный адрес сайта (и `NODE_VERSION` = `24.22.1`).
5. **Create Static Site**, после первого деплоя при необходимости нажмите **Manual Deploy → Clear build cache & deploy**.

### После деплоя

- Проверьте, что открывается главная и что `/og-image.jpg` отдаётся по адресу из `VITE_SITE_URL`
  (превью в мессенджерах ломается, если там остался `example.com`).
- Свой домен: **Settings → Custom Domains**, затем поменяйте `VITE_SITE_URL` и сделайте redeploy.
- Сайт закрыт от индексации (`<meta name="robots" content="noindex, nofollow">`) — это осознанно
  для персонального приглашения.

## Структура

```
src/            компоненты сцен, конфиг приглашения, стили
public/         изображения (AVIF/WebP/JPEG), музыка, иконки, OG-картинка
tools/          скрипты обработки ассетов, музыки и OG (не входят в сборку)
render.yaml     конфигурация Render Blueprint
```
