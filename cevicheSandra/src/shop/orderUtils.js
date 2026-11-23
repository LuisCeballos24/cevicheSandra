// Lógica pura de la tienda en línea: distancia, delivery y mensajes del pedido.
import { SITE } from '../config/siteConfig';
import { money } from '../ventas/ventaHelpers';

// Distancia en km entre dos puntos (fórmula de Haversine)
export const distanceKm = (a, b) => {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

// Sucursal más cercana a una ubicación y su distancia
export const nearestLocation = (point) => SITE.locations
  .map(l => ({ location: l, km: distanceKm(point, l.coords) }))
  .sort((a, b) => a.km - b.km)[0];

// Costo aproximado de delivery (se confirma por WhatsApp)
export const estimateDelivery = (point) => {
  if (!point) return null;
  const { location, km } = nearestLocation(point);
  return { location, km, cost: Math.round(km * SITE.deliveryCostPerKm * 100) / 100 };
};

export const mapsPointLink = (point) => `https://www.google.com/maps?q=${point.lat},${point.lng}`;

const itemLines = (order) => order
  .map(i => `• ${i.quantity}x ${i.cevicheName}${i.size !== '1' ? ` (${i.size})` : ''} - ${money(i.subtotal)}`)
  .join('\n');

const deliveryLines = ({ delivery, pickupLocation, point, address, deliveryEstimate }) => {
  if (!delivery) return `🏪 *Retiro en:* ${pickupLocation}`;
  const lines = ['🛵 *Delivery*'];
  if (address) lines.push(`Dirección: ${address}`);
  if (point) lines.push(`Ubicación: ${mapsPointLink(point)}`);
  if (deliveryEstimate) lines.push(`Delivery aprox.: ${money(deliveryEstimate.cost)} (desde ${deliveryEstimate.location.name}, a confirmar)`);
  return lines.join('\n');
};

// Mensaje de WhatsApp que el cliente envía al negocio
export const buildWebOrderMessage = ({ customer, order, total, ...deliveryInfo }) => [
  `¡Hola ${SITE.shortName}! Quiero hacer este pedido 🦐`,
  '',
  itemLines(order),
  '',
  `*Total productos: ${money(total)}*`,
  deliveryLines(deliveryInfo),
  '',
  `👤 *Nombre:* ${customer.name}`,
  customer.phone ? `📱 *Teléfono:* ${customer.phone}` : null,
  customer.notes ? `📝 *Notas:* ${customer.notes}` : null,
].filter(line => line !== null).join('\n');

// Correo de confirmación para el cliente (texto plano)
export const buildWebOrderEmail = ({ customer, order, total, ...deliveryInfo }) => [
  `¡Gracias por tu pedido, ${customer.name}!`,
  '',
  'Resumen del pedido:',
  itemLines(order),
  '',
  `Total productos: ${money(total)}`,
  deliveryLines(deliveryInfo).replace(/\*/g, ''),
  customer.notes ? `Notas: ${customer.notes}` : null,
  '',
  `Te confirmaremos por WhatsApp (${SITE.phoneDisplay}).`,
  SITE.googleReviewUrl ? `\nCuando lo pruebes, ¡cuéntanos qué te pareció! Tu reseña en Google nos ayuda mucho: ${SITE.googleReviewUrl}` : null,
  SITE.name,
].filter(line => line !== null).join('\n');
