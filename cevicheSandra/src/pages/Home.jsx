import { Link } from 'react-router-dom';
import { FaLeaf, FaMotorcycle, FaAward, FaStar, FaMapMarkerAlt, FaUtensils, FaWhatsapp, FaSmileBeam } from 'react-icons/fa';
import { SITE } from '../config/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { useMenuData } from '../hooks/useMenuData';
import { SectionTitle, WhatsAppButton, ProductCard, LocationCard, Reveal, Wave, Marquee } from '../layout/SiteUi';

// Productos destacados en la portada (ids de cevichesData.json) y su etiqueta
const FEATURED = [
  { id: 11, badge: 'El más pedido' },
  { id: 1, badge: 'Clásico' },
  { id: 4 },
  { id: 5 },
  { id: 13 },
  { id: 15, badge: 'Refrescante' },
];

// Fotos reales del negocio para la galería
const GALLERY = [
  { src: '/img/coctelTropical2.webp', alt: 'Cócteles tropicales listos para llevar', className: 'md:col-span-2 md:row-span-2' },
  { src: '/img/cevicheCorvina2.webp', alt: 'Ceviche de corvina en vaso' },
  { src: '/img/coctelMixto2.webp', alt: 'Cóctel mixto' },
  { src: '/img/cevicheHawaiCamaronPulpo.webp', alt: 'Ceviche Hawai de camarón y pulpo' },
  { src: '/img/coctelPersonalizado.webp', alt: 'Cóctel personalizado' },
  { src: '/img/cevicheConchaNegra.webp', alt: 'Ceviche de concha negra con nachos', className: 'md:col-span-2' },
  { src: '/img/coctelCorvina.webp', alt: 'Preparando ceviche de corvina' },
  { src: '/img/camaronTradicional.webp', alt: 'Ceviche de camarón tradicional' },
];

const SIZES = [
  { label: '7oz', img: '/img/VasoTrasparente7oz.webp', note: 'Para probar' },
  { label: '16oz', img: '/img/VasoIcopor16oz.webp', note: 'El favorito' },
  { label: '24oz', img: '/img/VasoIcopor24oz.webp', note: 'Con hambre' },
  { label: 'Medio galón', img: '/img/medioGalon.webp', note: 'Para compartir' },
  { label: 'Galón', img: '/img/Galon.webp', note: 'Para la fiesta' },
];

const FEATURES = [
  { icon: FaLeaf, title: 'Siempre fresco', text: 'Preparados con mariscos frescos e ingredientes de calidad.' },
  { icon: FaAward, title: `Desde ${SITE.since}`, text: 'Recetas de la casa que nuestros clientes vuelven a pedir.' },
  { icon: FaMotorcycle, title: 'Pide fácil', text: 'Escríbenos por WhatsApp o haz tu pedido en línea.' },
];

const STEPS = [
  { icon: FaUtensils, title: 'Elige tu favorito', text: 'Mira el menú: ceviches, cócteles y extras en cinco tamaños.' },
  { icon: FaWhatsapp, title: 'Escríbenos', text: 'Mándanos tu pedido por WhatsApp o pídelo en línea.' },
  { icon: FaSmileBeam, title: 'Disfruta', text: 'Pasa por tu pedido a la sucursal más cercana y ¡buen provecho!' },
];

const MARQUEE_ITEMS = ['Corvina', 'Camarón', 'Langostino', 'Pulpo', 'Concha negra', 'Mixto', 'Tropical', 'Hawai'];

const Home = () => {
  usePageMeta({
    title: 'Ceviche fresco en Panamá',
    description: `Ceviches y cócteles de mariscos frescos en Panamá desde ${SITE.since}. Corvina, camarón, langostino, pulpo, concha negra y mixtos. Sucursales en Altos de la Calzada y Praderas de San Lorenzo. Pide por WhatsApp.`,
    path: '/',
  });
  const { menu } = useMenuData();
  const featured = FEATURED.map(f => ({ ...f, product: menu.find(p => p.id === f.id) })).filter(f => f.product);

  return (
    <>
      {/* PORTADA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-dark via-ocean to-ocean-light text-white">
        <span className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl" aria-hidden="true" />
        <span className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-ocean-light/40 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-6 md:pt-20 md:pb-10 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
              <FaMapMarkerAlt className="text-coral" /> Panamá · {SITE.locations.map(l => l.name).join(' · ')}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05]">
              Ceviches y cócteles
              <span className="block font-script font-normal text-coral text-5xl sm:text-6xl md:text-7xl mt-2">bien frescos</span>
            </h1>
            <p className="mt-6 text-lg text-white/85 max-w-md">
              Corvina, camarón, langostino, pulpo, concha negra y mixtos. Desde 7oz hasta galón, para ti o para compartir.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <WhatsAppButton />
              <Link to="/menu" className="inline-flex items-center justify-center bg-white text-ocean font-semibold px-7 py-3.5 rounded-full hover:bg-sand hover:-translate-y-0.5 transition shadow-lg">
                Ver menú y precios
              </Link>
            </div>
          </div>

          {/* Collage de fotos */}
          <div className="relative h-[340px] sm:h-[420px] md:h-[480px]">
            <img src="/img/hero.webp" alt="Cóctel Tropical de Donde Sandra" fetchpriority="high"
              className="absolute right-0 top-0 w-[72%] h-[78%] object-cover rounded-[2rem] shadow-2xl ring-4 ring-white/20" />
            <img src="/img/cevicheCorvina2.webp" alt="Ceviche de corvina" loading="lazy"
              className="absolute left-0 bottom-0 w-[48%] h-[52%] object-cover rounded-[2rem] shadow-2xl ring-4 ring-white -rotate-6 animate-float" />
            <img src="/img/coctelMixto2.webp" alt="Cóctel mixto" loading="lazy"
              className="absolute right-[6%] bottom-[2%] w-[32%] h-[34%] object-cover rounded-3xl shadow-2xl ring-4 ring-white rotate-6" />
            <div className="absolute left-[4%] top-[8%] bg-white text-ocean rounded-2xl shadow-xl px-4 py-3 rotate-[-4deg]">
              <p className="text-xs text-gray-500">Desde</p>
              <p className="text-2xl font-extrabold leading-none">$3.00</p>
            </div>
          </div>
        </div>
        <Wave />
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 120} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition flex gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-coral to-coral-dark text-white flex items-center justify-center shadow-lg shadow-coral/30"><Icon size={24} /></div>
              <div>
                <h2 className="font-bold text-lg text-ocean">{title}</h2>
                <p className="text-sm text-gray-600 mt-1">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee items={MARQUEE_ITEMS} />

      {/* DESTACADOS */}
      <section className="max-w-6xl mx-auto px-4 pt-20">
        <SectionTitle eyebrow="Favoritos de la casa" title="Lo que más piden" subtitle="Toca un producto para ver todos los tamaños y precios." />
        <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3">
          {featured.length > 0
            ? featured.map(({ product, badge }, i) => (
              <Reveal key={product.id} delay={(i % 3) * 100}><ProductCard product={product} badge={badge} /></Reveal>
            ))
            : Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-3xl bg-sand-dark animate-pulse" />)}
        </div>
        <div className="text-center mt-10">
          <Link to="/menu" className="inline-flex items-center bg-ocean hover:bg-ocean-dark text-white font-semibold px-8 py-3.5 rounded-full transition shadow-lg">
            Ver el menú completo →
          </Link>
        </div>
      </section>

      {/* CÓMO PEDIR */}
      <section className="mt-20">
        <Wave fill="#ffffff" flip={false} className="-mb-px" />
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
            <SectionTitle eyebrow="Así de fácil" title="Pide en 3 pasos" />
            <div className="grid gap-6 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 150} className="relative text-center px-4">
                  <div className="mx-auto h-20 w-20 rounded-full bg-coral-light text-coral flex items-center justify-center mb-4">
                    <Icon size={32} />
                  </div>
                  <span className="absolute top-0 left-1/2 ml-6 h-8 w-8 rounded-full bg-ocean text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <h3 className="font-extrabold text-xl text-ocean">{title}</h3>
                  <p className="text-gray-600 mt-2">{text}</p>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-10"><WhatsAppButton label="Hacer mi pedido" /></div>
          </div>
        </div>
        <Wave fill="#ffffff" flip className="-mt-px" />
      </section>

      {/* GALERÍA */}
      <section className="max-w-6xl mx-auto px-4 pt-16">
        <SectionTitle eyebrow="Hecho por nosotros" title="Así se ve lo bueno" subtitle="Fotos reales de nuestros ceviches y cócteles." />
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3 md:gap-4">
          {GALLERY.map(({ src, alt, className = '' }, i) => (
            <Reveal key={src} delay={(i % 4) * 80} className={`group relative overflow-hidden rounded-3xl ${className}`}>
              <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                <span className="text-white text-sm font-semibold">{alt}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TAMAÑOS */}
      <section className="mt-20 bg-gradient-to-br from-ocean-dark to-ocean text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <SectionTitle light eyebrow="Para cada ocasión" title="Del vasito al galón" subtitle="Todos nuestros ceviches y cócteles vienen en cinco tamaños." />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SIZES.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="text-center group">
                <div className="aspect-square rounded-3xl bg-[#1f1f22] overflow-hidden ring-1 ring-white/10 group-hover:ring-coral transition">
                  <img src={s.img} alt={`Tamaño ${s.label}`} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
                </div>
                <p className="font-extrabold mt-3 text-lg">{s.label}</p>
                <p className="text-sm text-coral-light">{s.note}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SUCURSALES */}
      <section className="max-w-6xl mx-auto px-4 pt-20">
        <SectionTitle eyebrow="Visítanos" title="Nuestras sucursales" subtitle="Pasa a retirar tu pedido o escríbenos para coordinar." />
        <div className="grid gap-6 md:grid-cols-2">
          {SITE.locations.map((l, i) => <Reveal key={l.name} delay={i * 120}><LocationCard location={l} /></Reveal>)}
        </div>
      </section>

      {/* LLAMADO FINAL */}
      <section className="max-w-6xl mx-auto px-4 pt-20">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-coral to-coral-dark text-white p-10 md:p-16 text-center shadow-2xl shadow-coral/30">
          <span className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
          <span className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative">
            <p className="font-script text-3xl md:text-4xl">¿Antojo de ceviche?</p>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2">Pide ahora y disfrútalo hoy</h2>
            <p className="mt-4 text-white/90 max-w-xl mx-auto">Escríbenos por WhatsApp. Y si ya nos probaste, tu reseña en Google nos ayuda muchísimo.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <WhatsAppButton />
              {SITE.googleReviewUrl && (
                <a href={SITE.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-coral-dark font-semibold px-7 py-3.5 rounded-full hover:bg-sand transition">
                  <FaStar /> Dejar reseña en Google
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default Home;
