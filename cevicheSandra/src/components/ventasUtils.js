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
