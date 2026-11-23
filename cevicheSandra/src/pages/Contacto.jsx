import { FaWhatsapp, FaEnvelope, FaClock, FaStar, FaInstagram, FaTiktok, FaFacebookF } from 'react-icons/fa';

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', icon: FaInstagram, className: 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]' },
  { key: 'tiktok', label: 'TikTok', icon: FaTiktok, className: 'bg-black' },
  { key: 'facebook', label: 'Facebook', icon: FaFacebookF, className: 'bg-[#1877f2]' },
].filter(s => SITE.social[s.key]);
import { SITE, whatsappLink } from '../config/siteConfig';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHero, LocationCard, SectionTitle } from '../layout/SiteUi';

const Contacto = () => {
  usePageMeta({
    title: 'Contacto y sucursales',
    description: `Contacta a ${SITE.name}. Pedidos por WhatsApp al ${SITE.phoneDisplay}. Sucursales en Altos de la Calzada y Praderas de San Lorenzo, Panamá.`,
    path: '/contacto',
  });

  return (
    <>
      <PageHero eyebrow="¡Hablemos!" title="Contáctanos" subtitle="Escríbenos para pedidos, eventos o pedidos grandes por galón." />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3 mb-16">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 shadow-sm border border-sand-dark hover:shadow-lg transition flex gap-4 items-start">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-[#25D366]/15 text-[#1ebe5b] flex items-center justify-center"><FaWhatsapp size={24} /></div>
            <div>
              <h2 className="font-bold text-ocean">WhatsApp</h2>
              <p className="text-gray-600 text-sm mt-1">{SITE.phoneDisplay}</p>
              <p className="text-coral text-sm font-semibold mt-2">Escribir ahora →</p>
            </div>
          </a>
          <a href={`mailto:${SITE.email}`} className="bg-white rounded-2xl p-6 shadow-sm border border-sand-dark hover:shadow-lg transition flex gap-4 items-start min-w-0">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-coral-light text-coral flex items-center justify-center"><FaEnvelope size={22} /></div>
            <div className="min-w-0">
              <h2 className="font-bold text-ocean">Correo</h2>
              <p className="text-gray-600 text-sm mt-1 break-all">{SITE.email}</p>
            </div>
          </a>
          {SITE.hours ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand-dark flex gap-4 items-start">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-ocean/10 text-ocean flex items-center justify-center"><FaClock size={22} /></div>
              <div>
                <h2 className="font-bold text-ocean">Horario</h2>
                <p className="text-gray-600 text-sm mt-1">{SITE.hours}</p>
              </div>
            </div>
          ) : SITE.googleReviewUrl ? (
            <a href={SITE.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 shadow-sm border border-sand-dark hover:shadow-lg transition flex gap-4 items-start">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center"><FaStar size={22} /></div>
              <div>
                <h2 className="font-bold text-ocean">Tu opinión cuenta</h2>
                <p className="text-gray-600 text-sm mt-1">Déjanos una reseña en Google</p>
              </div>
            </a>
          ) : null}
        </div>

        {SOCIALS.length > 0 && (
          <div className="text-center mb-16">
            <p className="font-script text-2xl text-coral">Síguenos</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ocean mt-1">Mira lo que preparamos cada día</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {SOCIALS.map(({ key, label, icon: Icon, className }) => (
                <a key={key} href={SITE.social[key]} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:-translate-y-0.5 transition ${className}`}>
                  <Icon size={18} /> {label}
                </a>
              ))}
            </div>
          </div>
        )}

        <SectionTitle eyebrow="Visítanos" title="Nuestras sucursales" />
        <div className="grid gap-6 md:grid-cols-2">
          {SITE.locations.map(l => <LocationCard key={l.name} location={l} />)}
        </div>
      </div>
    </>
  );
};

export default Contacto;
