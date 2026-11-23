import { Link } from 'react-router-dom';
import { FaLeaf, FaMotorcycle, FaAward, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { SITE } from '../siteConfig';
import { usePageMeta } from '../usePageMeta';
import { useMenuData } from '../useMenuData';
import { SectionTitle, WhatsAppButton, ProductCard, LocationCard } from './SiteUi';

// Productos destacados en la portada (ids de cevichesData.json)
const FEATURED_IDS = [11, 1, 4, 5, 13, 15];

const SIZES = [
  { label: '7oz', img: '/img/VasoTrasparente7oz.webp' },
  { label: '16oz', img: '/img/VasoIcopor16oz.webp' },
  { label: '24oz', img: '/img/VasoIcopor24oz.webp' },
  { label: 'Medio galón', img: '/img/medioGalon.webp' },
  { label: 'Galón', img: '/img/Galon.webp' },
];

const FEATURES = [
  { icon: FaLeaf, title: 'Siempre fresco', text: 'Preparados con mariscos frescos e ingredientes de calidad.' },
  { icon: FaAward, title: `Desde ${SITE.since}`, text: 'Recetas de la casa que nuestros clientes vuelven a pedir.' },
  { icon: FaMotorcycle, title: 'Pide fácil', text: 'Escríbenos por WhatsApp o haz tu pedido en línea.' },
];

const Home = () => {
  usePageMeta({
    title: 'Ceviche fresco en Panamá',
    description: `Ceviches y cócteles de mariscos frescos en Panamá desde ${SITE.since}. Corvina, camarón, langostino, pulpo, concha negra y mixtos. Sucursales en Altos de la Calzada y Praderas de San Lorenzo. Pide por WhatsApp.`,
    path: '/',
  });
  const { menu } = useMenuData();
  const featured = FEATURED_IDS.map(id => menu.find(p => p.id === id)).filter(Boolean);

  return (
    <>
      {/* PORTADA */}
      <section className="relative overflow-hidden bg-ocean-dark">
        <img src="/img/hero.webp" alt="" fetchpriority="high" className="absolute inset-0 w-full h-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-dark via-ocean-dark/80 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-xl text-white">
            <p className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold mb-5">
              <FaMapMarkerAlt className="text-coral" /> Panamá · {SITE.locations.map(l => l.name).join(' · ')}
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Ceviches y cócteles <span className="text-coral">frescos</span> como en casa
            </h1>
            <p className="mt-5 text-lg text-white/85">
              Corvina, camarón, langostino, pulpo, concha negra y mixtos. Desde 7oz hasta galón, para ti o para compartir.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <WhatsAppButton />
              <Link to="/menu" className="inline-flex items-center justify-center bg-white text-ocean font-semibold px-6 py-3 rounded-full hover:bg-sand transition">
                Ver menú y precios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-lg flex gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-coral-light text-coral flex items-center justify-center"><Icon size={22} /></div>
              <div>
                <h2 className="font-bold text-ocean">{title}</h2>
                <p className="text-sm text-gray-600 mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="max-w-6xl mx-auto px-4 pt-20">
        <SectionTitle eyebrow="Favoritos de la casa" title="Lo que más piden nuestros clientes" subtitle="Toca un producto para ver tamaños y precios." />
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
          {featured.length > 0
            ? featured.map(p => <ProductCard key={p.id} product={p} />)
            : Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-2xl bg-sand-dark animate-pulse" />)}
        </div>
        <div className="text-center mt-10">
          <Link to="/menu" className="inline-flex items-center bg-ocean hover:bg-ocean-dark text-white font-semibold px-8 py-3 rounded-full transition">
            Ver el menú completo
          </Link>
        </div>
      </section>

      {/* TAMAÑOS */}
      <section className="bg-white mt-20">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <SectionTitle eyebrow="Para cada ocasión" title="Del vasito al galón" subtitle="Todos nuestros ceviches y cócteles vienen en cinco tamaños." />
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {SIZES.map(s => (
              <div key={s.label} className="text-center">
                <div className="aspect-square rounded-2xl bg-[#1f1f22] overflow-hidden flex items-center justify-center">
                  <img src={s.img} alt={`Tamaño ${s.label}`} loading="lazy" className="w-full h-full object-contain" />
                </div>
                <p className="font-bold text-ocean mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCURSALES */}
      <section className="max-w-6xl mx-auto px-4 pt-20">
        <SectionTitle eyebrow="Visítanos" title="Nuestras sucursales" subtitle="Pasa a retirar tu pedido o escríbenos para coordinar." />
        <div className="grid gap-6 md:grid-cols-2">
          {SITE.locations.map(l => <LocationCard key={l.name} location={l} />)}
        </div>
      </section>

      {/* RESEÑAS / LLAMADO FINAL */}
      <section className="max-w-6xl mx-auto px-4 pt-20">
        <div className="rounded-3xl bg-gradient-to-br from-coral to-coral-dark text-white p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-2xl md:text-4xl font-extrabold">¿Antojo de ceviche?</h2>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">Haz tu pedido ahora por WhatsApp. Y si ya nos probaste, tu reseña en Google nos ayuda muchísimo.</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <WhatsAppButton />
            {SITE.googleReviewUrl && (
              <a href={SITE.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-coral-dark font-semibold px-6 py-3 rounded-full hover:bg-sand transition">
                <FaStar /> Dejar reseña en Google
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
