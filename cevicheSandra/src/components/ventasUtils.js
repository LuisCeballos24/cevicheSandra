import { db } from './FirebaseConfig';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';

// Rango [inicio, fin] de un día como Timestamps de Firestore
export const dayRange = (date = new Date()) => ({
  start: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)),
  end: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)),
});

// Query de pedidos de un día (todos los usuarios)
export const ordersOfDayQuery = (date = new Date()) => {
  const { start, end } = dayRange(date);
  return query(
    collection(db, "orders"),
    where("timestamp", ">=", start),
    where("timestamp", "<=", end)
  );
};

// Documentos de hoy de un usuario en una colección con campos { user, date }
export const fetchTodayDocs = async (collectionName, userName) => {
  const q = query(
    collection(db, collectionName),
    where('user', '==', userName),
    where('date', '==', new Date().toDateString())
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => d.data());
};

export const existsToday = async (collectionName, userName) =>
  (await fetchTodayDocs(collectionName, userName)).length > 0;

// Guarda un documento del día con usuario, fecha y hora
export const saveTodayDoc = (collectionName, userName, data) =>
  addDoc(collection(db, collectionName), {
    user: userName,
    date: new Date().toDateString(),
    ...data,
    timestamp: new Date(),
  });

// Pedidos del día de un usuario (filtrado por usuario en cliente para no requerir índice compuesto)
export const fetchTodayOrders = async (userName) => {
  const querySnapshot = await getDocs(ordersOfDayQuery());
  return querySnapshot.docs.map(d => d.data()).filter(o => o.user === userName);
};

// Envases del inventario y el tamaño de venta que los usa
export const CONTAINERS = [
  { key: 'envases16oz', size: '16oz', label: '16oz' },
  { key: 'envases24oz', size: '24oz', label: '24oz' },
  { key: 'vasos7oz', size: '7oz', label: '7oz' },
];

// Suma los envases recibidos durante el día (documentos de 'container_receipts')
export const sumReceipts = (receipts = []) =>
  Object.fromEntries(CONTAINERS.map(({ key }) => [
    key,
    receipts.reduce((sum, r) => sum + (parseInt(r[key]) || 0), 0),
  ]));

// Envases recibidos hoy por un usuario
export const fetchTodayReceipts = (userName) => fetchTodayDocs('container_receipts', userName);

// Cuadre de envases: (apertura + recibidos - cierre) = usados, comparado con lo vendido en el sistema.
// faltan > 0 significa envases usados que no se reportaron como venta.
export const buildContainerCheck = (initialInventory = {}, finalInventory = {}, orders = [], received = {}) =>
  CONTAINERS.map(({ key, size, label }) => {
    const apertura = parseInt(initialInventory[key]);
    const cierre = parseInt(finalInventory[key]);
    const recibidos = parseInt(received[key]) || 0;
    const vendidos = orders
      .flatMap(o => o.items || [])
      .filter(i => i.size === size)
      .reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0);
    if (isNaN(apertura) || isNaN(cierre)) {
      return { label, apertura: null, recibidos, cierre: null, usados: null, vendidos, faltan: null };
    }
    const usados = apertura + recibidos - cierre;
    return { label, apertura, recibidos, cierre, usados, vendidos, faltan: usados - vendidos };
  });

// Clasificación de Venta por método de pago
export const sumTotals = (orders) => {
  const totals = { efectivo: 0, yappy: 0, tarjeta: 0 };
  orders.forEach(o => {
    const monto = parseFloat(o.total) || 0;
    if (o.paymentMethod === "Yappy") totals.yappy += monto;
    else if (o.paymentMethod === "Tarjeta") totals.tarjeta += monto;
    else totals.efectivo += monto;
  });
  return totals;
};
