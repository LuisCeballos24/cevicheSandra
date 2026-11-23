// Pre-render: guarda cada página pública como HTML ya armado (mejor para Google y carga inicial).
// Se ejecuta después de "vite build". Si no hay Chrome disponible, avisa y deja el sitio como SPA normal.
//
// Resultado en dist/:
//   app.html            -> copia limpia de la app (destino de las rutas sin pre-render, ver firebase.json)
//   index.html          -> página de inicio pre-renderizada
//   menu.html, ceviche/1.html, sucursales/....html, etc. (firebase "cleanUrls" las sirve sin .html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const routes = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'routes.json'), 'utf8'));

// 1. La app limpia siempre debe existir (firebase.json reescribe a /app.html)
fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, 'app.html'));

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find(p => fs.existsSync(p));

if (!chromePath) {
  console.warn('[prerender] No se encontró Chrome/Edge: se omite el pre-render (el sitio funciona igual).');
  process.exit(0);
}

const outFile = (route) => route === '/'
  ? path.join(dist, 'index.html')
  : path.join(dist, `${route.replace(/^\//, '')}.html`);

let server;
let browser;
try {
  const { chromium } = await import('playwright-core');
  // vite preview sirve dist/index.html (todavía la app limpia) para cualquier ruta, igual que Firebase
  server = await preview({ root, logLevel: 'silent', preview: { port: 4179, strictPort: false } });
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  browser = await chromium.launch({ executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Primero se capturan todas; se escriben al final para no servir páginas ya pre-renderizadas
  const pages = new Map();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#root h1') !== null, null, { timeout: 15000 });
    await page.waitForTimeout(300);
    const html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);
    if (html.includes('Página no encontrada')) throw new Error(`La ruta ${route} mostró "Página no encontrada"`);
    pages.set(route, html);
  }
  for (const [route, html] of pages) {
    const file = outFile(route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
  console.log(`[prerender] ${pages.size} páginas generadas con ${path.basename(chromePath)}`);
} catch (error) {
  // Si algo falla, se restaura la app limpia y el deploy sigue funcionando como SPA
  fs.copyFileSync(path.join(dist, 'app.html'), path.join(dist, 'index.html'));
  console.warn('[prerender] Falló, se publica sin pre-render:', error.message);
} finally {
  await browser?.close();
  await new Promise(resolve => (server ? server.httpServer.close(resolve) : resolve()));
}
