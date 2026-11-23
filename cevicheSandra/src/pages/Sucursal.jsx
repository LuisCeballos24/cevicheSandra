import { Link, useParams } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaDirections, FaGoogle, FaShoppingBag, FaStar } from 'react-icons/fa';
import { SITE, mapsDirectionsLink, mapsEmbedLink, restaurantSchema } from '../config/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMenuData } from '../hooks/useMenuData';
import { PageHero, WhatsAppButton, ProductCard, Reveal } from '../layout/SiteUi';
import Faq from '../layout/Faq';

// Productos destacados en la página de cada sucursal
const FEATURED_IDS = [11, 1, 4, 5, 13, 15];

const Sucursal = () => {
  const { slug } = useParams();
  const location = SITE.locations.find(l => l.slug === slug);
  const { menu } = useMenuData();

  usePageMeta(location ? {
    title: `Ceviche en ${location.name}`,
    description: `Ceviches y cócteles de mariscos frescos en ${location.name}, ${location.area}. ${SITE.hours}. Pide por WhatsApp al ${SITE.phoneDisplay}.`,
    path: `/sucursales/${location.slug}`,
  } : { title: 'Sucursal no encontrada', noindex: true });

  if (!location) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-extrabold text-ocean">Sucursal no encontrada</h1>
        <Link to="/contacto" className="inline-block mt-6 bg-coral text-white font-semibold px-6 py-3 rounded-full">Ver sucursales</Link>
      </div>
    );
  }

  const others = SITE.locations.filter(l => l.slug !== slug);
  const featured = FEATURED_IDS.map(id => menu.find(p => p.id === id)).filter(Boolean);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema(location)) }} />
      <PageHero
        eyebrow="Nuestra sucursal"
        title={`Ceviches y cócteles en ${location.name}`}
        subtitle={`Ceviches de corvina, camarón, langostino, pulpo y mixtos, preparados frescos en ${location.name}. Pasa a retirar o pide delivery.`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Reveal className="rounded-3xl overflow-hidden shadow-lg bg-white min-h-[320px]">
            <iframe
              title={`Mapa de ${SITE.name} en ${location.name}`}
              src={mapsEmbedLink(location.mapsQuery)}
              className="w-full h-full min-h-[320px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>

          <Reveal delay={100} className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-5">
            <div className="flex gap-3">
              <FaMapMarkerAlt className="text-coral mt-1 shrink-0" size={20} />
              <div>
                <h2 className="font-bold text-ocean">Dirección</h2>
                <p className="text-gray-600 text-sm">{location.name}, {location.area}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <FaClock className="text-coral mt-1 shrink-0" size={20} />
              <div>
                <h2 className="font-bold text-ocean">Horario</h2>
                <p className="text-gray-600 text-sm">{SITE.hours}</p>
                <p className="text-gray-500 text-xs mt-1">{SITE.hoursNote}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <WhatsAppButton text={`Hola ${SITE.shortName}, quiero hacer un pedido en ${location.name}.`} className="w-full" />
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-coral hover:bg-coral-dark text-white font-semibold px-6 py-3 rounded-full transition">
                <FaShoppingBag /> Ordenar en línea
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <a href={mapsDirectionsLink(location.mapsQuery)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white text-sm font-semibold px-3 py-2.5 rounded-full transition">
                  <FaDirections /> Cómo llegar
                </a>
                {SITE.googleBusinessUrl && (
                  <a href={SITE.googleBusinessUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white text-sm font-semibold px-3 py-2.5 rounded-full transition">
                    <FaGoogle /> Ver en Google
                  </a>
                )}
              </div>
              {SITE.googleReviewUrl && (
                <a href={SITE.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="text-center text-sm text-gray-500 hover:text-coral mt-1">
                  <FaStar className="inline text-yellow-400 mr-1" /> ¿Ya nos visitaste? Déjanos tu reseña
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <section className="pt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ocean mb-2">Los favoritos en {location.name}</h2>
          <p className="text-gray-600 mb-6">Todos en 7oz, 16oz, 24oz, medio galón y galón.</p>
          <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/menu" className="inline-flex bg-ocean hover:bg-ocean-dark text-white font-semibold px-8 py-3.5 rounded-full transition">Ver menú y precios →</Link>
          </div>
        </section>
      </div>

      <Faq menu={menu} />

      {others.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-16 text-center">
          <p className="text-gray-600">También estamos en {others.map((l, i) => (
            <span key={l.slug}>{i > 0 && ' y '}<Link to={`/sucursales/${l.slug}`} className="text-coral font-semibold hover:underline">{l.name}</Link></span>
          ))}.</p>
        </section>
      )}
    </>
  );
};

export default Sucursal;
