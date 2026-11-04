// Эмуляция деплоя: распаковать zip -> отдать статикой -> проверить рендер.
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  puppeteer = require('module').createRequire(process.cwd() + '/package.json')('puppeteer');
}
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain', '.ico': 'image/x-icon',
};

(async () => {
  const server = http.createServer((req, res) => {
    let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    fs.readFile(p, (e, d) => {
      if (e) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      res.end(d);
    });
  });
  await new Promise((r) => server.listen(4174, r));

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto('http://localhost:4174', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('h1', { timeout: 10000 });

  const st = await page.evaluate(async () => {
    const r = await fetch('/assets/' + performance.getEntriesByType('resource').find((e) => e.name.endsWith('.js')).name.split('/assets/')[1]);
    return { h1: !!document.querySelector('h1'), assetStatus: r.status };
  });
  console.log('EXTRACTED DEPLOY CHECK:', JSON.stringify(st), '| pageerrors:', JSON.stringify(errors));
  await browser.close();
  server.close();
  process.exit(st.h1 && st.assetStatus === 200 && errors.length === 0 ? 0 : 2);
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
