import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok, FaMapMarkerAlt, FaWhatsapp, FaEnvelope, FaGoogle, FaStar } from 'react-icons/fa';
import { SITE, whatsappLink, mapsDirectionsLink } from '../config/siteConfig';

const logo = '/img/logo.webp';

const SOCIAL_ICONS = { instagram: FaInstagram, facebook: FaFacebookF, tiktok: FaTiktok };

const Footer = () => {
  const socials = Object.entries(SITE.social).filter(([, url]) => url);

  return (
    <footer className="bg-ocean-dark text-white/80 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={logo} alt={`Logo ${SITE.name}`} width="80" height="80" loading="lazy" className="h-20 w-20 object-contain mb-3" />
          <p className="font-bold text-white">{SITE.name}</p>
          <p className="text-sm mt-2">Ceviches y cócteles de mariscos frescos en Panamá desde {SITE.since}.</p>
        </div>

        <div>
          <h2 className="text-white font-bold mb-4">Sucursales</h2>
          <ul className="space-y-3 text-sm">
            {SITE.locations.map(l => (
              <li key={l.name}>
                <a href={mapsDirectionsLink(l.mapsQuery)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-coral transition">
                  <FaMapMarkerAlt className="mt-1 shrink-0 text-coral" />
                  <span><span className="text-white font-semibold">{l.name}</span><br />{l.area}</span>
                </a>
              </li>
            ))}
          </ul>
          {SITE.hours && <p className="text-sm mt-3">Horario: {SITE.hours}</p>}
        </div>

        <div>
          <h2 className="text-white font-bold mb-4">Navegación</h2>
          <nav className="flex flex-col gap-2 text-sm">
            <Link to="/" className="hover:text-coral transition">Inicio</Link>
            <Link to="/menu" className="hover:text-coral transition">Menú y precios</Link>
            <Link to="/shop" className="hover:text-coral transition">Ordenar en línea</Link>
            <Link to="/nosotros" className="hover:text-coral transition">Nosotros</Link>
            <Link to="/contacto" className="hover:text-coral transition">Contacto</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-white font-bold mb-4">Contacto</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-coral transition">
                <FaWhatsapp className="text-[#25D366]" /> {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-coral transition break-all">
                <FaEnvelope className="shrink-0" /> {SITE.email}
              </a>
            </li>
            {SITE.googleBusinessUrl && (
              <li>
                <a href={SITE.googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-coral transition">
                  <FaGoogle /> Ver en Google
                </a>
              </li>
            )}
            {SITE.googleReviewUrl && (
              <li>
                <a href={SITE.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-coral transition">
                  <FaStar className="text-yellow-400" /> Déjanos tu reseña
                </a>
              </li>
            )}
          </ul>
          {socials.length > 0 && (
            <div className="flex gap-3 mt-4">
              {socials.map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key} className="h-9 w-9 rounded-full bg-white/10 hover:bg-coral flex items-center justify-center text-white transition">
                    <Icon />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
