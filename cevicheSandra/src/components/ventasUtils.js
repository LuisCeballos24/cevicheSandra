import { db } from './FirebaseConfig';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

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

// Cuadre de envases: (apertura - cierre) = usados, comparado con lo vendido en el sistema.
// faltan > 0 significa envases usados que no se reportaron como venta.
export const buildContainerCheck = (initialInventory = {}, finalInventory = {}, orders = []) =>
  CONTAINERS.map(({ key, size, label }) => {
    const apertura = parseInt(initialInventory[key]);
    const cierre = parseInt(finalInventory[key]);
    const vendidos = orders
      .flatMap(o => o.items || [])
      .filter(i => i.size === size)
      .reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0);
    if (isNaN(apertura) || isNaN(cierre)) {
      return { label, apertura: null, cierre: null, usados: null, vendidos, faltan: null };
    }
    const usados = apertura - cierre;
    return { label, apertura, cierre, usados, vendidos, faltan: usados - vendidos };
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
