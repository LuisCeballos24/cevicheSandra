import { Link } from 'react-router-dom';
import { FaHeart, FaBullseye, FaEye } from 'react-icons/fa';
import { SITE } from '../siteConfig';
import { usePageMeta } from '../usePageMeta';
import { PageHero, WhatsAppButton } from './SiteUi';

const VALUES = [
  {
    icon: FaHeart,
    title: 'Nuestra historia',
    text: `Desde ${SITE.since}, ${SITE.name} ofrece ceviches y cócteles de la más alta calidad y sabor. Somos una cevichería registrada y legalmente establecida en Panamá, cumpliendo con las normativas del país para darte una experiencia segura y confiable.`,
  },
  {
    icon: FaBullseye,
    title: 'Misión',
    text: 'Ofrecer ceviches frescos y deliciosos, con ingredientes de la más alta calidad, siguiendo recetas tradicionales con un toque propio. Que cada bocado sea una celebración del sabor.',
  },
  {
    icon: FaEye,
    title: 'Visión',
    text: 'Ser la cevichería más reconocida y querida de Panamá, destacando por nuestra calidad y autenticidad, y llegar a más clientes sin perder el sabor de siempre.',
  },
];

const About = () => {
  usePageMeta({
    title: 'Nosotros',
    description: `Conoce la historia de ${SITE.name}, cevichería panameña desde ${SITE.since} con ceviches y cócteles de mariscos frescos.`,
    path: '/nosotros',
  });

  return (
    <>
      <PageHero title="Sobre nosotros" subtitle={`Cevichería panameña desde ${SITE.since}.`} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 items-center mb-16">
          <img src="/img/ejemploPedido2.webp" alt={`Pedido de ${SITE.name}`} loading="lazy" className="rounded-3xl shadow-xl w-full aspect-[4/3] object-cover" />
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ocean">Hecho con cariño, servido fresco</h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Cada ceviche y cóctel se prepara con mariscos frescos y nuestras recetas de la casa. Tenemos sucursales en {SITE.locations.map(l => l.name).join(' y ')}.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <WhatsAppButton />
              <Link to="/menu" className="inline-flex items-center justify-center border-2 border-ocean text-ocean font-semibold px-6 py-3 rounded-full hover:bg-ocean hover:text-white transition">
                Ver menú
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-sand-dark">
              <div className="h-12 w-12 rounded-xl bg-coral-light text-coral flex items-center justify-center mb-4"><Icon size={20} /></div>
              <h2 className="font-bold text-lg text-ocean">{title}</h2>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default About;
