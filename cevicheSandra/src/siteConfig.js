// Datos del negocio usados en todo el sitio (header, footer, contacto y SEO).
// Si cambias algo aquí, actualiza también el bloque JSON-LD de index.html.
export const SITE = {
  name: 'Ceviches y Cócteles Donde Sandra',
  shortName: 'Donde Sandra',
  url: 'https://propios-c6d5c.web.app',
  email: 'cevichesycoctelesdondesandra@gmail.com',
  // WhatsApp para pedidos (formato internacional sin +)
  whatsapp: '50767961550',
  phoneDisplay: '+507 6796-1550',
  since: 2019,
  // Enlace del perfil de Google Business (ej: https://g.page/r/XXXX). Vacío = no se muestra.
  googleBusinessUrl: '',
  // Enlace para dejar reseña (ej: https://g.page/r/XXXX/review). Vacío = no se muestra.
  googleReviewUrl: '',
  // Horario visible en el sitio. Vacío = no se muestra.
  hours: '',
  // Redes sociales. Vacío = no se muestra.
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
  },
  locations: [
    {
      name: 'Altos de la Calzada',
      area: 'Distrito de Panamá, Panamá',
      mapsQuery: 'Ceviches y Cocteles Donde Sandra, Altos de la Calzada, Panamá',
    },
    {
      name: 'Praderas de San Lorenzo',
      area: 'Caimitillo, Panamá',
      mapsQuery: 'Praderas de San Lorenzo, Caimitillo, Panamá',
    },
  ],
};

export const whatsappLink = (text = '') =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapsDirectionsLink = (query) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

export const mapsEmbedLink = (query) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
