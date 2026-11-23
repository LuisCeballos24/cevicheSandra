// Datos del negocio usados en todo el sitio (header, footer, contacto y SEO).
// Si cambias algo aquí, actualiza también el bloque JSON-LD de index.html.
export const SITE = {
  name: 'Ceviches y Cócteles Donde Sandra',
  shortName: 'Donde Sandra',
  url: 'https://cevichesycoctelesdondesandra.com',
  email: 'cevichesycoctelesdondesandra@gmail.com',
  // WhatsApp para pedidos (formato internacional sin +)
  whatsapp: '50767961550',
  phoneDisplay: '+507 6796-1550',
  since: 2019,
  // Enlace del perfil de Google Business (ej: https://g.page/r/XXXX). Vacío = no se muestra.
  googleBusinessUrl: 'https://share.google/DWYD5YMKKSdwqj6F5',
  // Enlace para dejar reseña (ej: https://g.page/r/XXXX/review). Vacío = no se muestra.
  googleReviewUrl: 'https://g.page/r/CYzuVjYlhBXbEAE/review',
  // Horario visible en el sitio. Vacío = no se muestra.
  hours: 'Martes a domingo, 3:00 p. m. a 11:00 p. m.',
  hoursNote: 'Algunos lunes también abrimos: consúltanos por WhatsApp.',
  // Horario para Google (schema.org). Los lunes no se publican porque no son fijos.
  openingHours: { days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '15:00', closes: '23:00' },
  // Redes sociales. Vacío = no se muestra.
  social: {
    instagram: 'https://www.instagram.com/ceviche.sandra/',
    facebook: '',
    tiktok: 'https://www.tiktok.com/@ceviches.donde.sa',
  },
  // Delivery: costo aproximado por km en línea recta desde la sucursal más cercana
  deliveryCostPerKm: 1.5,
  locations: [
    {
      slug: 'altos-de-la-calzada',
      name: 'Altos de la Calzada',
      area: 'Distrito y Corregimiento de Panamá, Provincia de Panamá',
      address: { street: 'Altos de la Calzada', locality: 'Panamá', region: 'Panamá' },
      mapsQuery: 'Ceviches y Cocteles Donde Sandra, Altos de la Calzada, Panamá',
      coords: { lat: 9.147490, lng: -79.538451 },
    },
    {
      slug: 'praderas-de-san-lorenzo',
      name: 'Praderas de San Lorenzo',
      area: 'Caimitillo, Panamá',
      address: { street: 'Praderas de San Lorenzo', locality: 'Caimitillo', region: 'Panamá' },
      mapsQuery: 'Praderas de San Lorenzo, Caimitillo, Panamá',
      coords: { lat: 9.122934, lng: -79.536636 },
    },
  ],
};

export const whatsappLink = (text = '') =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapsDirectionsLink = (query) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

// Datos estructurados (schema.org) de una sucursal para Google
export const restaurantSchema = (location) => ({
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: `${SITE.name} - ${location.name}`,
  url: `${SITE.url}/sucursales/${location.slug}`,
  image: `${SITE.url}/img/og-image.jpg`,
  telephone: SITE.phoneDisplay.replace(/ /g, '-'),
  servesCuisine: ['Ceviche', 'Mariscos', 'Cócteles de mariscos'],
  priceRange: '$',
  hasMenu: `${SITE.url}/menu`,
  acceptsReservations: false,
  address: {
    '@type': 'PostalAddress',
    streetAddress: location.address.street,
    addressLocality: location.address.locality,
    addressRegion: location.address.region,
    addressCountry: 'PA',
  },
  geo: { '@type': 'GeoCoordinates', latitude: location.coords.lat, longitude: location.coords.lng },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: SITE.openingHours.days,
    opens: SITE.openingHours.opens,
    closes: SITE.openingHours.closes,
  }],
  sameAs: [SITE.googleBusinessUrl, ...Object.values(SITE.social)].filter(Boolean),
});

export const mapsEmbedLink = (query) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
