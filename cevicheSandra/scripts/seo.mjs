// Genera, a partir de src/config/siteConfig.js:
//  - el bloque JSON-LD (datos para Google) de index.html
//  - public/sitemap.xml
// Se ejecuta solo antes de cada build (npm run build).
import fs from 'node:fs';
import { SITE, restaurantSchema } from '../src/config/siteConfig.js';

const root = new URL('..', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const write = (p, text) => fs.writeFileSync(new URL(p, root), text);

// ---------- JSON-LD ----------
const orgId = `${SITE.url}/#org`;
const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: SITE.name,
      url: `${SITE.url}/`,
      logo: `${SITE.url}/img/logo.webp`,
      email: SITE.email,
      telephone: SITE.phoneDisplay.replace(/ /g, '-'),
      foundingDate: String(SITE.since),
      sameAs: [SITE.googleBusinessUrl, ...Object.values(SITE.social)].filter(Boolean),
    },
    ...SITE.locations.map(l => {
      const { '@context': _ctx, ...schema } = restaurantSchema(l);
      return { ...schema, parentOrganization: { '@id': orgId } };
    }),
  ],
};

const START = '<!-- seo:jsonld:start -->';
const END = '<!-- seo:jsonld:end -->';
let html = read('index.html');
if (!html.includes(START)) throw new Error('index.html no tiene los marcadores seo:jsonld');
const block = `${START}\n    <script type="application/ld+json">\n${JSON.stringify(graph, null, 2).replace(/^/gm, '    ')}\n    </script>\n    ${END}`;
html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
write('index.html', html);

// ---------- sitemap.xml ----------
const menu = JSON.parse(read('public/cevichesData.json'));
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ['/', '1.0'],
  ['/menu', '0.9'],
  ['/shop', '0.8'],
  ...SITE.locations.map(l => [`/sucursales/${l.slug}`, '0.8']),
  ['/contacto', '0.7'],
  ['/nosotros', '0.6'],
  ...menu.map(p => [`/ceviche/${p.id}`, '0.6']),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr]) => `  <url><loc>${SITE.url}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
write('public/sitemap.xml', sitemap);

// Rutas públicas para el pre-render (scripts/prerender.mjs)
write('scripts/routes.json', JSON.stringify(urls.map(([p]) => p), null, 2) + '\n');

console.log(`SEO: JSON-LD actualizado, sitemap con ${urls.length} URLs`);
