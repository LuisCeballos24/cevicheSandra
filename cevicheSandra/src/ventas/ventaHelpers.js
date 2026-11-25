// Lógica pura de ventas (sin Firebase ni React): precios, inventario y mensajes de WhatsApp.

// Minutos hacia atrás en los que un pedido idéntico se considera posible repetición
export const DUPLICATE_WINDOW_MINUTES = 10;

// Billetes rápidos para "Paga con"
export const QUICK_CASH = [5, 10, 20, 50];

export const PAYMENT_METHODS = ['Efectivo', 'Yappy', 'Tarjeta'];

export const money = (n) => `$${Number(n).toFixed(2)}`;

// ---------- Precios y promociones ----------

// Precio final de un producto según las promociones activas
export const calculatePrice = (product, size, { promoCorvina, promo16oz }) => {
  const originalPrice = parseFloat(product.prices[size]);
  const isCoctelCorvina = product.id == 10 || product.name === 'Cóctel Corvina';

  // 1. Promo Corvina ($5.50) tiene prioridad; 2. Promo general -$1.00 en 16oz
  if (promoCorvina && isCoctelCorvina && size === '16oz') {
    return { originalPrice, price: 5.50, promos: 'Promo Corvina ($5.50)' };
  }
  if (promo16oz && size === '16oz') {
    return { originalPrice, price: originalPrice - 1.00, promos: '-1$ 16oz' };
  }
  return { originalPrice, price: originalPrice, promos: '' };
};

// Contador para que cada línea del carrito tenga un id único aunque se creen en el mismo milisegundo
let nextItemId = 0;

// Agrega al carrito; si ya existe la misma línea (producto, tamaño, precio y promo) suma la cantidad
export const addItemToOrder = (order, product, size, qty, promoFlags) => {
  const { originalPrice, price, promos } = calculatePrice(product, size, promoFlags);
  const existing = order.find(i => i.cevicheId === product.id && i.size === size && i.price === price && i.promos === promos);
  if (existing) {
    return order.map(i => i.id === existing.id
      ? { ...i, quantity: i.quantity + qty, subtotal: i.price * (i.quantity + qty) }
      : i);
  }
  return [...order, {
    id: `${product.id}-${size}-${Date.now()}-${nextItemId++}`,
    cevicheId: product.id,
    cevicheName: product.name,
    size,
    quantity: qty,
    originalPrice,
    price, // precio ya con descuento
    subtotal: price * qty,
    promos,
  }];
};

// +/- en el carrito; en 0 se elimina la línea
export const changeItemQuantity = (order, itemId, delta) => order
  .map(i => i.id === itemId ? { ...i, quantity: i.quantity + delta, subtotal: i.price * (i.quantity + delta) } : i)
  .filter(i => i.quantity > 0);

export const orderTotal = (order) => order.reduce((sum, item) => sum + item.subtotal, 0);

// ---------- Pedidos repetidos ----------

// Firma de los items (sin importar el orden) para comparar pedidos
const itemsSignature = (items = []) =>
  items.map(i => `${i.cevicheName}|${i.size}|${i.quantity}`).sort().join(';');

// Busca un pedido idéntico enviado en los últimos minutos
export const findPossibleDuplicate = (orders, items, total, now = Date.now()) => {
  const signature = itemsSignature(items);
  const limit = now - DUPLICATE_WINDOW_MINUTES * 60 * 1000;
  return orders.find(o => {
    const time = o.timestamp?.toDate ? o.timestamp.toDate().getTime() : 0;
    return time >= limit
      && Math.abs((parseFloat(o.total) || 0) - total) < 0.01
      && itemsSignature(o.items) === signature;
  });
};

// ---------- Inventario ----------

const EMPTY_CEVICHE_LEVEL = { galonLleno: false, galonMedio: false, galonMedioLleno: false, galonUnCuarto: false, noHay: false };

// Estructura vacía del inventario (inicial y final)
export const createEmptyInventory = () => ({
  // Insumos
  nachosGrande: '', nachosPequeno: '', vasos7oz: '', cucharas: false, bolsitas5x10: false,
  sodas: '', platanitos: '', envases16oz: '', envases24oz: '', uvas: false,
  kiwi: false, coco: false, pina: false, nachosSinPreparar: false, vuelto: false,
  // Ceviches
  cevicheTradicionalCorvina: { ...EMPTY_CEVICHE_LEVEL },
  coctelCorvina: { ...EMPTY_CEVICHE_LEVEL },
  cevicheCamaron: { ...EMPTY_CEVICHE_LEVEL },
  cevicheLangostino: { ...EMPTY_CEVICHE_LEVEL },
  cevicheMixto: { ...EMPTY_CEVICHE_LEVEL },
  cevicheConchaNegra: { ...EMPTY_CEVICHE_LEVEL },
  cevichePulpo: { ...EMPTY_CEVICHE_LEVEL },
  cevicheCombinacion: { ...EMPTY_CEVICHE_LEVEL },
});

export const INVENTORY_LABELS = {
  nachosGrande: 'Nachos Grandes',
  nachosPequeno: 'Nachos Pequeños',
  vasos7oz: 'Vasos 7oz',
  cucharas: 'Cucharas',
  bolsitas5x10: 'Bolsitas 5x10',
  sodas: 'Sodas',
  platanitos: 'Platanitos',
  envases16oz: 'Envases 16oz',
  envases24oz: 'Envases 24oz',
  uvas: 'Uvas',
  kiwi: 'Kiwi',
  coco: 'Coco',
  pina: 'Piña',
  vuelto: 'Te dieron Vuelto?',
  nachosSinPreparar: 'Nachos sin preparar',
  cevicheTradicionalCorvina: 'Ceviche Tradicional Corvina',
  cevicheCamaron: 'Ceviche Camarón',
  cevicheLangostino: 'Ceviche Langostino',
  cevicheMixto: 'Ceviche Mixto',
  cevicheConchaNegra: 'Ceviche Concha Negra',
  coctelMixto: 'Cóctel Mixto',
  coctelCamaron: 'Cóctel Camarón',
  coctelCorvina: 'Cóctel Corvina',
  coctelTropical: 'Cóctel Tropical',
  cevichePulpo: 'Ceviche Pulpo',
  cevicheCombinacion: 'Ceviche Combinación',
  coctelPersonalizado: 'Cóctel PERSONALIZADO',
  coctelHawaiCorvina: 'Cóctel Hawai Corvina',
  coctelHawaiCamaronPulpo: 'Cóctel Hawai Camarón/Pulpo',
};

export const getInventoryLabel = (key) => INVENTORY_LABELS[key] || key;

// Campos del inventario que faltan por llenar (cantidades vacías o ceviches sin nivel marcado).
// Las casillas (uvas, kiwi...) no cuentan: sin marcar significa "sí hay".
export const findMissingInventory = (inventory) => Object.entries(inventory)
  .filter(([, value]) => {
    if (typeof value === 'boolean') return false;
    if (typeof value === 'object' && value !== null) {
      return !(value.galonLleno || value.galonMedioLleno || value.galonMedio || value.galonUnCuarto || value.noHay);
    }
    const n = Number(value);
    return value === '' || value == null || String(value).trim() === '' || isNaN(n) || n < 0;
  })
  .map(([key]) => key);

const cevicheLevel = (value) => {
  if (value.galonLleno) return 'Galón Lleno (4/4)';
  if (value.galonMedioLleno) return 'Casi Lleno (3/4)';
  if (value.galonMedio) return 'Medio Galón (2/4)';
  if (value.galonUnCuarto) return 'Un Cuarto (1/4)';
  if (value.noHay) return 'VACÍO';
  return 'Sin marcar';
};

// Texto del inventario para WhatsApp (una línea por producto)
export const buildInventoryText = (inventory) => Object.entries(inventory).map(([key, value]) => {
  const name = getInventoryLabel(key);
  if (typeof value === 'object' && value !== null) {
    const received = value.receivedQuantity > 0
      ? ` | 📦 Recibió: ${value.receivedQuantity} ${value.receivedQuantity === 1 ? 'gln' : 'glns'}`
      : '';
    return `\n- ${name}: ${cevicheLevel(value)}${received}`;
  }
  if (typeof value === 'boolean') return `\n- ${name}: ${value ? 'NO HAY' : 'Sí hay'}`;
  return `\n- ${name}: ${value || '0'}`;
}).join('');

// ---------- Mensajes de WhatsApp ----------

export const buildOrderMessage = ({ userName, order, total, paymentMethod, isDelivery, cashReceived, isPossibleDuplicate }) => {
  const itemsText = order.map(item => {
    const promoText = item.promos ? ` (Promos: ${item.promos})` : '';
    return `• ${item.quantity}x ${item.cevicheName} (${item.size}) - ${money(item.subtotal)}${promoText}`;
  }).join('\n');
  const duplicateText = isPossibleDuplicate ? `⚠️ *POSIBLE PEDIDO REPETIDO* ⚠️\n` : '';
  const changeText = cashReceived != null
    ? `\nPaga con: ${money(cashReceived)}\n*Cambio: ${money(cashReceived - total)}*`
    : '';
  return `${duplicateText}*¡Nuevo Pedido!*\nUser: ${userName}\n\n${itemsText}\n\n*Total: ${money(total)}*${changeText}`
    + `\nDelivery: ${isDelivery ? 'Sí' : 'No'}\nYappy: ${paymentMethod === 'Yappy' ? 'Sí' : 'No'}\nTarjeta: ${paymentMethod === 'Tarjeta' ? 'Sí' : 'No'}`;
};

export const buildInventoryMessage = ({ userName, inventory }) =>
  `*¡Reporte de Inventario Inicial!* 🌅\n*Usuario:* ${userName}\n*Fecha:* ${new Date().toLocaleDateString()}\n\n*DETALLES:*${buildInventoryText(inventory)}`;

const containerLine = (c) => {
  if (c.usados === null) return `\n- ${c.label}: sin conteo de apertura (vendidos ${c.vendidos})`;
  const status = c.faltan === 0 ? '✅ Cuadra' : c.faltan > 0 ? `⚠️ Faltan ${c.faltan}` : `⚠️ Sobran ${-c.faltan}`;
  const receivedText = c.recibidos > 0 ? `, recibió ${c.recibidos}` : '';
  return `\n- ${c.label}: abrió ${c.apertura}${receivedText}, cerró ${c.cierre} → usados ${c.usados} | reportados ${c.vendidos} → ${status}`;
};

export const buildClosingMessage = ({ userName, systemTotals, cashReported, containerCheck, inventory }) =>
  `*Cierre de Caja - ${userName}*\nFecha: ${new Date().toLocaleDateString()}\n\n*DINERO:*`
  + `\n- Sistema (Efectivo): ${money(systemTotals.efectivo)}\n- Sistema (Yappy): ${money(systemTotals.yappy)}\n- Sistema (Tarjeta): ${money(systemTotals.tarjeta)}`
  + `\n----------------\n- En Caja (Efectivo Real): ${money(cashReported)}\n- Diferencia Efectivo: ${money(cashReported - systemTotals.efectivo)}`
  + `\n\n*CUADRE DE ENVASES:*${containerCheck.map(containerLine).join('')}`
  + `\n\n*INVENTARIO FINAL:*${buildInventoryText(inventory)}`;
