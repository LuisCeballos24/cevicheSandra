import { useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { SITE } from '../siteConfig';
import { usePageMeta } from '../usePageMeta';
import { useMenuData, getImages, formatPrice, minPrice, sizeLabel, getCategory } from '../useMenuData';
import { WhatsAppButton, ProductCard } from './SiteUi';

// Foto de ejemplo de cada envase
const SIZE_IMAGES = {
  '7oz': '/img/VasoTrasparente7oz.webp',
  '16oz': '/img/VasoIcopor16oz.webp',
  '24oz': '/img/VasoIcopor24oz.webp',
  'medio galon': '/img/medioGalon.webp',
  'galon': '/img/Galon.webp'
};

const CevicheDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { menu, loading } = useMenuData();
  // Se usa el producto que viene de la navegación o se busca por id (enlace directo / Google)
  const ceviche = menu.find(p => String(p.id) === id) || state?.ceviche;

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  usePageMeta({
    title: ceviche ? `${ceviche.name} desde ${formatPrice(minPrice(ceviche.prices))}` : 'Producto',
    description: ceviche
      ? `${ceviche.name} de ${SITE.name}. ${(ceviche.description || '').slice(0, 120)}`.trim()
      : undefined,
    path: `/ceviche/${id}`,
    image: ceviche ? getImages(ceviche.image)[0] : undefined,
  });

  if (!ceviche) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        {loading
          ? <div className="h-10 w-10 mx-auto rounded-full border-4 border-coral-light border-t-coral animate-spin" />
          : <>
              <p className="text-lg text-gray-600 mb-6">No encontramos este producto.</p>
              <Link to="/menu" className="bg-ocean text-white px-6 py-3 rounded-full font-semibold">Ver el menú</Link>
            </>}
      </div>
    );
  }

  const images = getImages(ceviche.image);
  const sizes = Object.entries(ceviche.prices);
  const related = menu.filter(p => p.id !== ceviche.id && getCategory(p.name) === getCategory(ceviche.name)).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: ceviche.name,
    description: ceviche.description,
    image: images.map(i => `${SITE.url}${i}`),
    offers: sizes.map(([size, price]) => ({
      '@type': 'Offer',
      name: sizeLabel(size),
      price: Number(price).toFixed(2),
      priceCurrency: 'USD',
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link to="/menu" className="inline-flex items-center gap-2 text-ocean font-semibold mb-6 hover:text-coral transition">
        <FaArrowLeft /> Volver al menú
      </Link>

      <div className="grid gap-8 md:gap-12 md:grid-cols-2">
        {/* Galería */}
        <div>
          <div className="aspect-square rounded-3xl overflow-hidden bg-sand-dark shadow-lg">
            <img src={images[activeImage]} alt={`${ceviche.name} - ${SITE.name}`} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 transition ${i === activeImage ? 'border-coral' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  aria-label={`Ver foto ${i + 1}`}
                >
                  <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-ocean">{ceviche.name}</h1>
          <p className="text-coral font-bold text-xl mt-2">Desde {formatPrice(minPrice(ceviche.prices))}</p>
          {ceviche.description && <p className="text-gray-600 mt-5 leading-relaxed">{ceviche.description}</p>}

          <h2 className="font-bold text-ocean mt-8 mb-3">Tamaños y precios</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sizes.map(([size, price]) => (
              <button
                key={size}
                onClick={() => setSelectedSize(SIZE_IMAGES[size] ? size : null)}
                className={`rounded-xl border p-3 text-left transition ${selectedSize === size ? 'border-coral bg-coral-light' : 'border-sand-dark bg-white hover:border-ocean'}`}
              >
                <span className="block text-sm text-gray-500 capitalize">{sizeLabel(size)}</span>
                <span className="block font-bold text-gray-800">{formatPrice(price)}</span>
              </button>
            ))}
          </div>
          {sizes.some(([size]) => SIZE_IMAGES[size]) && !selectedSize && (
            <p className="text-xs text-gray-500 mt-2">Toca un tamaño para ver cómo se presenta.</p>
          )}
          {selectedSize && (
            <div className="mt-4 bg-white rounded-2xl p-4 border border-sand-dark flex items-center gap-4">
              <img src={SIZE_IMAGES[selectedSize]} alt={`Envase ${selectedSize}`} className="h-28 w-28 object-contain" />
              <p className="text-sm text-gray-600">Así se presenta el tamaño <b className="capitalize">{sizeLabel(selectedSize)}</b>.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <WhatsAppButton
              text={`Hola ${SITE.shortName}, quiero pedir ${ceviche.name}${selectedSize ? ` de ${sizeLabel(selectedSize)}` : ''}.`}
              label="Pedir este por WhatsApp"
            />
            <Link to="/shop" className="inline-flex items-center justify-center border-2 border-ocean text-ocean font-semibold px-6 py-3 rounded-full hover:bg-ocean hover:text-white transition">
              Ordenar en línea
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-ocean mb-6">También te puede gustar</h2>
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default CevicheDetail;
