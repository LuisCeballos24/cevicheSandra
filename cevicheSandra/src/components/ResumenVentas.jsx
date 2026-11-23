import { useState, useEffect } from 'react';
import { db } from './FirebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ordersOfDayQuery, sumTotals, buildContainerCheck } from './ventasUtils';
import { FaSignOutAlt, FaMoneyBillWave, FaMobileAlt, FaCreditCard, FaExclamationTriangle, FaCashRegister } from 'react-icons/fa';

// SHA-256 de la clave de acceso al resumen (solo Sandra); la clave no se guarda en el código
const RESUMEN_PASSWORD_HASH = 'df76abfe559354e803a848ad8921a38109212d51cca03a4561e791e7294a24a6';

const sha256 = async (text) => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Locales conocidos (se muestran aunque no tengan ventas)
const LOCALES = ['cevicheSandra', 'cevicheAltos', 'cevichePraderas'];

// "2026-11-01" -> Date local
const parseInputDate = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const toInputDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const money = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;

const formatTime = (ts) => ts?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

const ResumenVentas = () => {
  const [hasAccess, setHasAccess] = useState(() => {
    try { return localStorage.getItem('resumenAccess') === 'true'; } catch { return false; }
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()));
  const [orders, setOrders] = useState([]);
  const [closings, setClosings] = useState([]);
  const [closingsStarted, setClosingsStarted] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);

  // Escucha en vivo los pedidos y cierres del día seleccionado
  useEffect(() => {
    if (!hasAccess) return;
    const date = parseInputDate(selectedDate);
    const dateString = date.toDateString();

    const unsubOrders = onSnapshot(ordersOfDayQuery(date), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0));
      setOrders(data);
    }, (e) => console.error('Error leyendo pedidos:', e));

    const unsubClosings = onSnapshot(
      query(collection(db, 'daily_closing_reports'), where('date', '==', dateString)),
      (snap) => setClosings(snap.docs.map(d => d.data())),
      (e) => console.error('Error leyendo cierres:', e)
    );

    const unsubStarted = onSnapshot(
      query(collection(db, 'closing_started'), where('date', '==', dateString)),
      (snap) => setClosingsStarted(snap.docs.map(d => d.data())),
      (e) => console.error('Error leyendo aperturas de cierre:', e)
    );

    return () => { unsubOrders(); unsubClosings(); unsubStarted(); };
  }, [hasAccess, selectedDate]);

  const handleLogin = async () => {
    if (await sha256(password) === RESUMEN_PASSWORD_HASH) {
      try { localStorage.setItem('resumenAccess', 'true'); } catch { /* sin almacenamiento */ }
      setHasAccess(true);
      setLoginError(null);
    } else {
      setLoginError('Clave incorrecta.');
    }
  };

  const handleLogout = () => {
    try { localStorage.removeItem('resumenAccess'); } catch { /* sin almacenamiento */ }
    setHasAccess(false);
    setPassword('');
  };

  // Pantalla de acceso
  if (!hasAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-orange-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">Resumen de Ventas</h2>
          <input type="password" placeholder="Clave" className="w-full mb-6 p-3 border rounded-xl" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          {loginError && <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>}
          <button onClick={handleLogin} className="bg-orange-500 text-white px-4 py-3 rounded-xl w-full font-bold hover:bg-orange-600 transition">Entrar</button>
        </div>
      </div>
    );
  }

  const users = [...new Set([...LOCALES, ...orders.map(o => o.user).filter(Boolean)])];
  const grandTotals = sumTotals(orders);
  const grandTotal = grandTotals.efectivo + grandTotals.yappy + grandTotals.tarjeta;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h1 className="text-2xl font-black text-gray-800">Resumen de Ventas</h1>
          <div className="flex items-center gap-3">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg bg-white text-sm" />
            <button onClick={handleLogout} className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><FaSignOutAlt /> Salir</button>
          </div>
        </div>

        {/* Totales Generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-gray-700">
            <p className="text-xs font-bold text-gray-500 uppercase">Total del día</p>
            <p className="text-2xl font-black text-gray-800">{money(grandTotal)}</p>
            <p className="text-xs text-gray-400">{orders.length} pedidos</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-green-500">
            <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><FaMoneyBillWave /> Efectivo</p>
            <p className="text-2xl font-black text-green-700">{money(grandTotals.efectivo)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-blue-500">
            <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><FaMobileAlt /> Yappy</p>
            <p className="text-2xl font-black text-blue-700">{money(grandTotals.yappy)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border-b-4 border-purple-500">
            <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><FaCreditCard /> Tarjeta</p>
            <p className="text-2xl font-black text-purple-700">{money(grandTotals.tarjeta)}</p>
          </div>
        </div>

        {/* Por Local */}
        <div className="space-y-4">
          {users.map(userName => {
            const userOrders = orders.filter(o => o.user === userName);
            const totals = sumTotals(userOrders);
            const duplicates = userOrders.filter(o => o.possibleDuplicate);
            const closing = closings.find(c => c.user === userName);
            const closingPending = !closing && closingsStarted.some(c => c.user === userName);
            const isExpanded = expandedUser === userName;

            return (
              <div key={userName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <h2 className="font-bold text-lg text-gray-800">{userName}</h2>
                    <span className="text-sm text-gray-500">{userOrders.length} pedidos</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-green-50 rounded-lg p-2"><p className="text-[11px] text-gray-500 uppercase font-bold">Efectivo</p><p className="font-black text-green-700">{money(totals.efectivo)}</p></div>
                    <div className="bg-blue-50 rounded-lg p-2"><p className="text-[11px] text-gray-500 uppercase font-bold">Yappy</p><p className="font-black text-blue-700">{money(totals.yappy)}</p></div>
                    <div className="bg-purple-50 rounded-lg p-2"><p className="text-[11px] text-gray-500 uppercase font-bold">Tarjeta</p><p className="font-black text-purple-700">{money(totals.tarjeta)}</p></div>
                  </div>

                  {/* Estado del cierre */}
                  {closing ? (
                    <div className={`rounded-lg p-3 text-sm mb-2 ${closing.cashReported - totals.efectivo < -0.009 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
                      <p className="font-bold flex items-center gap-2"><FaCashRegister /> Cierre enviado a las {formatTime(closing.timestamp)}</p>
                      <p>En caja: <b>{money(closing.cashReported)}</b> · Sistema efectivo: <b>{money(totals.efectivo)}</b> · Diferencia: <b>{money(closing.cashReported - totals.efectivo)}</b></p>
                    </div>
                  ) : null}

                  {/* Cuadre de envases (del cierre) o envases vendidos en vivo */}
                  {closing?.containerCheck ? (
                    <div className="overflow-x-auto mb-2">
                      <table className="w-full text-sm text-center">
                        <thead>
                          <tr className="text-[11px] text-gray-500 uppercase">
                            <th className="text-left p-1">Envase</th><th className="p-1">Abrió</th><th className="p-1">Recibió</th><th className="p-1">Cerró</th><th className="p-1">Usados</th><th className="p-1">Reportados</th><th className="p-1">Cuadre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {closing.containerCheck.map(c => (
                            <tr key={c.label} className="border-t border-gray-100">
                              <td className="text-left p-1 font-bold">{c.label}</td>
                              <td className="p-1">{c.apertura ?? '-'}</td>
                              <td className="p-1">{c.recibidos ?? 0}</td>
                              <td className="p-1">{c.cierre ?? '-'}</td>
                              <td className="p-1">{c.usados ?? '-'}</td>
                              <td className="p-1">{c.vendidos}</td>
                              <td className={`p-1 font-bold ${c.faltan === 0 ? 'text-green-700' : 'text-red-600'}`}>
                                {c.faltan === null ? 'Sin datos' : c.faltan === 0 ? '✅ Cuadra' : c.faltan > 0 ? `Faltan ${c.faltan}` : `Sobran ${-c.faltan}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mb-2">
                      Envases vendidos: {buildContainerCheck({}, {}, userOrders).map(c => `${c.label}: ${c.vendidos}`).join(' · ')}
                    </p>
                  )}

                  {closing ? null : closingPending ? (
                    <p className="rounded-lg p-3 text-sm mb-2 bg-yellow-50 text-yellow-800 font-bold">⏳ Abrió el cierre de caja pero todavía no lo envía</p>
                  ) : (
                    <p className="text-xs text-gray-400 mb-2">Sin cierre de caja</p>
                  )}

                  {duplicates.length > 0 && (
                    <p className="text-sm text-yellow-700 font-bold flex items-center gap-2 mb-2"><FaExclamationTriangle /> {duplicates.length} posible(s) pedido(s) repetido(s)</p>
                  )}

                  {userOrders.length > 0 && (
                    <button onClick={() => setExpandedUser(isExpanded ? null : userName)} className="text-sm text-orange-600 font-bold">
                      {isExpanded ? 'Ocultar pedidos' : 'Ver pedidos'}
                    </button>
                  )}
                </div>

                {/* Lista de pedidos */}
                {isExpanded && (
                  <ul className="border-t border-gray-100 divide-y divide-gray-100">
                    {userOrders.map(o => (
                      <li key={o.id} className={`p-3 text-sm ${o.possibleDuplicate ? 'bg-yellow-50' : ''}`}>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">{formatTime(o.timestamp)} · {o.paymentMethod || 'Efectivo'}{o.isDelivery ? ' · Delivery' : ''}</span>
                          <span className="font-bold text-gray-800">{money(o.total)}</span>
                        </div>
                        <p className="text-gray-600">{(o.items || []).map(i => `${i.quantity}x ${i.cevicheName} (${i.size})`).join(', ')}</p>
                        {o.possibleDuplicate && <p className="text-xs font-bold text-yellow-700">⚠️ Marcado como posible repetido</p>}
                        {o.cashReceived != null && <p className="text-xs text-gray-400">Pagó con {money(o.cashReceived)} · Cambio {money(o.change)}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResumenVentas;
