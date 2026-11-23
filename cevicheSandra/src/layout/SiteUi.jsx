import { Link } from 'react-router-dom';
import { FaWhatsapp, FaMapMarkerAlt, FaDirections, FaFire } from 'react-icons/fa';
import { SITE, whatsappLink, mapsDirectionsLink, mapsEmbedLink } from '../config/siteConfig';
import { getMainImage, minPrice, formatPrice } from '../hooks/useMenuData';
import { useReveal } from '../hooks/useReveal';

// Aparece suavemente al entrar en pantalla
export const Reveal = ({ as: Tag = 'div', className = '', delay = 0, children }) => {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
};

// Separador en forma de ola; "fill" es el color de la sección que sigue
export const Wave = ({ fill = '#fff7ec', flip = false, className = '' }) => (
  <svg viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"
    className={`block w-full h-10 md:h-16 ${flip ? 'rotate-180' : ''} ${className}`}>
    <path fill={fill} d="M0,48 C180,80 360,80 540,56 C720,32 900,0 1080,16 C1260,32 1350,56 1440,64 L1440,80 L0,80 Z" />
  </svg>
);

// Cinta de texto que se desplaza sola
export const Marquee = ({ items }) => {
  const row = items.map(t => (
    <span key={t} className="flex items-center gap-6 px-3 text-lg md:text-2xl font-extrabold uppercase tracking-wide">
      {t} <span className="text-coral">✦</span>
    </span>
  ));
  return (
    <div className="overflow-hidden bg-ocean text-white py-4 select-none" aria-hidden="true">
      <div className="flex w-max animate-marquee">{row}{row}</div>
    </div>
  );
};

export const SectionTitle = ({ eyebrow, title, subtitle, center = true, light = false }) => (
  <Reveal className={`mb-8 md:mb-12 ${center ? 'text-center mx-auto max-w-2xl' : ''}`}>
    {eyebrow && <p className={`font-script text-xl md:text-2xl mb-1 ${light ? 'text-coral-light' : 'text-coral'}`}>{eyebrow}</p>}
    <h2 className={`text-3xl md:text-5xl font-extrabold leading-tight ${light ? 'text-white' : 'text-ocean'}`}>{title}</h2>
    {subtitle && <p className={`mt-3 md:text-lg ${light ? 'text-white/80' : 'text-gray-600'}`}>{subtitle}</p>}
  </Reveal>
);

export const WhatsAppButton = ({ text, label = 'Pedir por WhatsApp', className = '' }) => (
  <a
    href={whatsappLink(text || `Hola ${SITE.shortName}, quiero hacer un pedido.`)}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-green-600/30 hover:-translate-y-0.5 transition ${className}`}
  >
    <FaWhatsapp size={20} /> {label}
  </a>
);

export const FloatingWhatsApp = () => (
  <a
    href={whatsappLink(`Hola ${SITE.shortName}, quiero hacer un pedido.`)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Pedir por WhatsApp"
    className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-110 transition"
  >
    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    <FaWhatsapp size={30} className="relative" />
  </a>
);

export const ProductCard = ({ product, badge }) => (
  <Link
    to={`/ceviche/${product.id}`}
    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition duration-300 flex flex-col h-full"
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-sand-dark">
      <img
        src={getMainImage(product.image)}
        alt={`${product.name} - ${SITE.name}`}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      {badge && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-coral text-white text-xs font-bold px-3 py-1 rounded-full shadow">
          <FaFire /> {badge}
        </span>
      )}
      <span className="absolute bottom-3 right-3 bg-white text-ocean text-sm font-extrabold px-3 py-1 rounded-full shadow">
        desde {formatPrice(minPrice(product.prices))}
      </span>
    </div>
    <div className="p-4 md:p-5 flex-1 flex items-center justify-between gap-2">
      <h3 className="font-bold text-gray-800 leading-tight md:text-lg">{product.name}</h3>
      <span className="shrink-0 h-9 w-9 rounded-full bg-coral-light text-coral flex items-center justify-center group-hover:bg-coral group-hover:text-white transition">→</span>
    </div>
  </Link>
);

export const LocationCard = ({ location }) => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col">
    <iframe
      title={`Mapa ${location.name}`}
      src={mapsEmbedLink(location.mapsQuery)}
      className="w-full h-60 border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="font-extrabold text-xl text-ocean flex items-center gap-2"><FaMapMarkerAlt className="text-coral" /> {location.name}</h3>
      <p className="text-gray-600 text-sm mt-1">{location.area}</p>
      {SITE.hours && <p className="text-gray-600 text-sm mt-1">Horario: {SITE.hours}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={mapsDirectionsLink(location.mapsQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
        >
          <FaDirections /> Cómo llegar
        </a>
        {SITE.googleBusinessUrl && (
          <a
            href={SITE.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white text-sm font-semibold px-5 py-2 rounded-full transition"
          >
            Ver en Google
          </a>
        )}
      </div>
    </div>
  </div>
);

export const PageHero = ({ title, subtitle, eyebrow }) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-ocean-dark via-ocean to-ocean-light text-white">
    {/* Burbujas decorativas */}
    <span className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white/5" aria-hidden="true" />
    <span className="absolute top-10 right-10 h-24 w-24 rounded-full bg-coral/20 animate-float" aria-hidden="true" />
    <span className="absolute bottom-16 left-1/3 h-12 w-12 rounded-full bg-white/10 animate-float" aria-hidden="true" />
    <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-10 md:pt-20 md:pb-14 text-center">
      {eyebrow && <p className="font-script text-2xl md:text-3xl text-coral-light mb-2">{eyebrow}</p>}
      <h1 className="text-4xl md:text-6xl font-extrabold">{title}</h1>
      {subtitle && <p className="mt-4 text-white/85 md:text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </div>
    <Wave />
  </section>
);
