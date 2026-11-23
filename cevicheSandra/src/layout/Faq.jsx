import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { SITE } from '../config/siteConfig';
import { formatPrice } from '../hooks/useMenuData';
import { SectionTitle, Reveal } from './SiteUi';

// Preguntas frecuentes; los precios se calculan del menú para que nunca queden desactualizados
export const buildFaqs = (menu) => {
  const pricesBySize = (size) => menu.map(p => Number(p.prices[size])).filter(n => !isNaN(n));
  const min7 = pricesBySize('7oz');
  const galon = pricesBySize('galon');
  const priceText = min7.length && galon.length
    ? ` El vaso de 7oz va desde ${formatPrice(Math.min(...min7))} y el galón desde ${formatPrice(Math.min(...galon))}.`
    : '';

  return [
    {
      q: '¿Cuál es su horario?',
      a: `${SITE.hours.replace(/\.?$/, '.')} ${SITE.hoursNote}`,
    },
    {
      q: '¿Dónde están ubicados?',
      a: `Tenemos dos sucursales en Panamá: ${SITE.locations.map(l => `${l.name} (${l.area})`).join(' y ')}.`,
    },
    {
      q: '¿Cómo hago un pedido?',
      a: `Escríbenos por WhatsApp al ${SITE.phoneDisplay} o haz tu pedido en línea en nuestra página: eliges tus productos y se abre WhatsApp con el pedido listo para enviar.`,
    },
    {
      q: '¿Hacen delivery?',
      a: 'Sí. El costo depende de la distancia desde la sucursal más cercana y te lo confirmamos por WhatsApp antes de enviar. También puedes pasar a retirar tu pedido.',
    },
    {
      q: '¿Qué tamaños y precios manejan?',
      a: `Todos nuestros ceviches y cócteles vienen en 7oz, 16oz, 24oz, medio galón y galón.${priceText}`,
    },
    {
      q: '¿Qué formas de pago aceptan?',
      a: 'Aceptamos efectivo, Yappy y tarjeta.',
    },
    {
      q: '¿Preparan pedidos grandes para fiestas o eventos?',
      a: 'Sí, el medio galón y el galón son ideales para compartir. Para pedidos grandes te recomendamos escribirnos con tiempo por WhatsApp.',
    },
  ];
};

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

const Faq = ({ menu, title = 'Preguntas frecuentes' }) => {
  const faqs = buildFaqs(menu);
  const [open, setOpen] = useState(0);

  return (
    <section className="max-w-3xl mx-auto px-4 pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <SectionTitle eyebrow="¿Tienes dudas?" title={title} />
      <div className="space-y-3">
        {faqs.map(({ q, a }, i) => (
          <Reveal key={q} delay={i * 50} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-bold text-ocean"
            >
              <h3>{q}</h3>
              <FaChevronDown className={`shrink-0 text-coral transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {/* La respuesta siempre está en el HTML (Google la lee); solo se oculta visualmente */}
            <div className={`px-5 text-gray-600 grid transition-all ${open === i ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]'}`}>
              <p className="overflow-hidden">{a}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Faq;
