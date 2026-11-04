// Смоук PWA любого проекта: манифест, service worker, офлайн-перезагрузка.
// Использование: node scripts/pwa/smoke-pwa.cjs [url]
// (по умолчанию http://localhost:4173 — поднятый `npx vite preview --port 4173`)
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  // скрипт общий: puppeteer ищем в node_modules проекта, откуда запущены
  puppeteer = require('module').createRequire(process.cwd() + '/package.json')('puppeteer');
}

const BASE = process.argv[2] || 'http://localhost:4173';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('h1', { timeout: 10000 });

  // Манифест доступен и корректен
  const manifestInfo = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return { link: false };
    const res = await fetch(link.href);
    const m = await res.json();
    return {
      link: true,
      status: res.status,
      name: m.name,
      display: m.display,
      start: m.start_url,
      icons: (m.icons || []).length,
      maskable: (m.icons || []).some((i) => (i.purpose || '').includes('maskable')),
    };
  });
  console.log('MANIFEST:', JSON.stringify(manifestInfo));

  // Service worker активен и управляет страницей
  await page.waitForFunction(
    'navigator.serviceWorker && navigator.serviceWorker.controller !== null',
    { timeout: 15000 },
  );
  const swState = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return { active: !!(reg && reg.active), scope: reg ? reg.scope : null };
  });
  console.log('SW:', JSON.stringify(swState));

  // Ассеты не 404 (главный признак битой упаковки/деплоя)
  const assetStatus = await page.evaluate(() => {
    const js = performance.getEntriesByType('resource').find(
      (e) => e.name.includes('/assets/') && e.name.endsWith('.js'),
    );
    return js ? js.responseStatus : 'n/a';
  });
  console.log('MAIN ASSET STATUS:', assetStatus);

  // Полностью офлайн: перезагрузка должна отработаться из кеша SW
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('h1', { timeout: 10000 });
  const offlineOk = await page.evaluate(() => !!document.querySelector('h1'));
  await page.setOfflineMode(false);
  console.log('OFFLINE RELOAD RENDERS:', offlineOk);

  const ok =
    manifestInfo.link &&
    manifestInfo.icons >= 2 &&
    manifestInfo.maskable &&
    swState.active &&
    assetStatus === 200 &&
    offlineOk &&
    errors.length === 0;
  console.log('PWA OK:', ok, '| pageerrors:', JSON.stringify(errors));
  await browser.close();
  process.exit(ok ? 0 : 2);
})().catch((e) => {
  console.error('SMOKE FAIL:', e.message);
  process.exit(1);
});
