import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../siteConfig';
import { usePageMeta } from '../usePageMeta';
import { useMenuData, MENU_CATEGORIES, getCategory, getMainImage, formatPrice, sizeLabel } from '../useMenuData';
import { PageHero, WhatsAppButton } from './SiteUi';

const Menu = () => {
  usePageMeta({
    title: 'Menú y precios',
    description: 'Menú de ceviches y cócteles de mariscos con precios: corvina, camarón, langostino, pulpo, concha negra, mixto y tropical en 7oz, 16oz, 24oz, medio galón y galón.',
    path: '/menu',
  });
  const { menu, loading, error } = useMenuData();
  const [category, setCategory] = useState('todos');

  const products = useMemo(
    () => menu.filter(p => category === 'todos' || getCategory(p.name) === category),
    [menu, category]
  );

  return (
    <>
      <PageHero title="Menú y precios" subtitle="Ceviches y cócteles preparados con mariscos frescos. Toca un producto para ver su historia y fotos." />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {MENU_CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition ${category === c.key ? 'bg-ocean text-white border-ocean' : 'bg-white text-gray-700 border-sand-dark hover:border-ocean'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {error && <p className="text-center text-red-600">No se pudo cargar el menú. Recarga la página.</p>}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-2xl bg-sand-dark animate-pulse" />)
            : products.map(p => (
              <article key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-sand-dark flex flex-col">
                <Link to={`/ceviche/${p.id}`} className="block aspect-[4/3] overflow-hidden bg-sand-dark">
                  <img src={getMainImage(p.image)} alt={`${p.name} - ${SITE.name}`} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </Link>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-bold text-lg text-ocean">
                    <Link to={`/ceviche/${p.id}`} className="hover:text-coral transition">{p.name}</Link>
                  </h2>
                  <ul className="mt-3 space-y-1 text-sm flex-1">
                    {Object.entries(p.prices).map(([size, price]) => (
                      <li key={size} className="flex justify-between border-b border-dashed border-sand-dark pb-1">
                        <span className="text-gray-600 capitalize">{sizeLabel(size)}</span>
                        <span className="font-semibold text-gray-800">{formatPrice(price)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/ceviche/${p.id}`} className="mt-4 text-sm font-semibold text-coral hover:text-coral-dark">Ver detalle →</Link>
                </div>
              </article>
            ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">¿Ya sabes lo que quieres?</p>
          <WhatsAppButton />
        </div>
      </div>
    </>
  );
};

export default Menu;
