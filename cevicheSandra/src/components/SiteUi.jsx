import { Link } from 'react-router-dom';
import { FaWhatsapp, FaMapMarkerAlt, FaDirections } from 'react-icons/fa';
import { SITE, whatsappLink, mapsDirectionsLink, mapsEmbedLink } from '../siteConfig';
import { getMainImage, minPrice, formatPrice } from '../useMenuData';

export const SectionTitle = ({ eyebrow, title, subtitle, center = true }) => (
  <div className={`mb-8 md:mb-10 ${center ? 'text-center mx-auto max-w-2xl' : ''}`}>
    {eyebrow && <p className="text-coral font-semibold uppercase tracking-widest text-xs mb-2">{eyebrow}</p>}
    <h2 className="text-2xl md:text-4xl font-extrabold text-ocean leading-tight">{title}</h2>
    {subtitle && <p className="text-gray-600 mt-3 md:text-lg">{subtitle}</p>}
  </div>
);

export const WhatsAppButton = ({ text, label = 'Pedir por WhatsApp', className = '' }) => (
  <a
    href={whatsappLink(text || `Hola ${SITE.shortName}, quiero hacer un pedido.`)}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold px-6 py-3 rounded-full shadow-lg transition ${className}`}
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
    <FaWhatsapp size={30} />
  </a>
);

export const ProductCard = ({ product }) => (
  <Link
    to={`/ceviche/${product.id}`}
    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-sand-dark flex flex-col"
  >
    <div className="aspect-[4/3] overflow-hidden bg-sand-dark">
      <img
        src={getMainImage(product.image)}
        alt={`${product.name} - ${SITE.name}`}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
      />
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-bold text-gray-800 leading-tight">{product.name}</h3>
      <p className="text-sm text-gray-500 mt-1">
        Desde <span className="text-coral font-bold text-base">{formatPrice(minPrice(product.prices))}</span>
      </p>
      <span className="mt-auto pt-3 text-sm font-semibold text-ocean group-hover:text-coral transition">Ver detalle →</span>
    </div>
  </Link>
);

export const LocationCard = ({ location }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sand-dark flex flex-col">
    <iframe
      title={`Mapa ${location.name}`}
      src={mapsEmbedLink(location.mapsQuery)}
      className="w-full h-56 border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-bold text-lg text-ocean flex items-center gap-2"><FaMapMarkerAlt className="text-coral" /> {location.name}</h3>
      <p className="text-gray-600 text-sm mt-1">{location.area}</p>
      {SITE.hours && <p className="text-gray-600 text-sm mt-1">Horario: {SITE.hours}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={mapsDirectionsLink(location.mapsQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition"
        >
          <FaDirections /> Cómo llegar
        </a>
        {SITE.googleBusinessUrl && (
          <a
            href={SITE.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-ocean text-ocean hover:bg-ocean hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition"
          >
            Ver en Google
          </a>
        )}
      </div>
    </div>
  </div>
);

export const PageHero = ({ title, subtitle }) => (
  <section className="bg-gradient-to-br from-ocean to-ocean-light text-white">
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
      <h1 className="text-3xl md:text-5xl font-extrabold">{title}</h1>
      {subtitle && <p className="mt-3 text-white/85 md:text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  </section>
);
