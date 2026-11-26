import { useState, useEffect, useMemo } from 'react';
import InventoryTextForm from './InventoryTextForm';
import { ClosingConfirmModal, DuplicateOrderModal, ReceiptModal, WhatsAppFallbackModal } from './VentaModals';
import {
  fetchTodayOrders, fetchTodayDocs, fetchTodayReceipts, existsToday, saveTodayDoc,
  sumTotals, sumReceipts, buildContainerCheck, CONTAINERS,
} from './ventasUtils';
import {
  QUICK_CASH, addItemToOrder, changeItemQuantity, orderTotal, findPossibleDuplicate,
  createEmptyInventory, buildOrderMessage, buildInventoryMessage, buildClosingMessage,
  findMissingInventory, getInventoryLabel,
} from './ventaHelpers';
import { loadMenu, MENU_CATEGORIES, getCategory, getMainImage } from '../hooks/useMenuData';
import { whatsappLink } from '../config/siteConfig';
import { FaTrash, FaSignOutAlt, FaCashRegister, FaWhatsapp, FaTag, FaCreditCard, FaBoxOpen, FaSearch, FaPlus, FaMinus, FaChevronUp, FaChevronDown, FaMoneyBillWave, FaMobileAlt, FaMotorcycle } from 'react-icons/fa';

const EMPTY_RECEIPT = { envases16oz: '', envases24oz: '', vasos7oz: '' };

// Usuarios Válidos
const VALID_USERS = {
  cevicheSandra: 'Ceviche.sandra@24',
  cevicheAltos: 'Altos.ceviche@24',
  cevichePraderas: 'Praderas.ceviche@24',
};

const PAYMENT_OPTIONS = [
  { key: 'Efectivo', label: 'Efectivo', icon: <FaMoneyBillWave />, active: 'bg-green-600 text-white border-green-600' },
  { key: 'Yappy', label: 'Yappy', icon: <FaMobileAlt />, active: 'bg-blue-600 text-white border-blue-600' },
  { key: 'Tarjeta', label: 'Tarjeta', icon: <FaCreditCard />, active: 'bg-purple-600 text-white border-purple-600' },
];

const CevicheVenta = () => {
  // ==========================================
  // 1. ESTADOS
  // ==========================================

  // Datos y Carrito
  const [cevichesData, setCevichesData] = useState([]);
  const [order, setOrder] = useState([]);

  // Promociones Activas
  const [promoCorvina, setPromoCorvina] = useState(false);
  const [promo16oz, setPromo16oz] = useState(false);

  // Usuario y Sesión
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });

  // UI y Modales
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);

  // Opciones de Pedido
  const [isDelivery, setIsDelivery] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [cashReceived, setCashReceived] = useState(''); // Monto con el que paga el cliente (efectivo)

  // Inventario y Reportes
  const [inventoryDailyReport, setInventoryDailyReport] = useState(createEmptyInventory);
  const [inventoryModalError, setInventoryModalError] = useState(null);

  // Cierre de Caja (los totales del sistema solo se ven dentro del cierre)
  const [dailyTotals, setDailyTotals] = useState({ efectivo: 0, yappy: 0, tarjeta: 0 });
  const [closingRegisterReport, setClosingRegisterReport] = useState({ dinero: '' });
  const [closingModalError, setClosingModalError] = useState(null);
  const [showClosingConfirm, setShowClosingConfirm] = useState(false);

  // WhatsApp pendiente de enviar con un toque (si el celular bloqueó la apertura automática)
  const [pendingWhatsApp, setPendingWhatsApp] = useState(null);
  const [formSending, setFormSending] = useState(false);
  const [checkingClosing, setCheckingClosing] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  // Lleva la pantalla al primer campo sin llenar
  const scrollToField = (key) => {
    setTimeout(() => {
      document.getElementById(`field-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // Aviso de posible pedido repetido (pedido anterior idéntico)
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Envases recibidos durante el día
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptForm, setReceiptForm] = useState(EMPTY_RECEIPT);
  const [receiptsToday, setReceiptsToday] = useState(EMPTY_RECEIPT);
  const [receiptError, setReceiptError] = useState(null);

  // Búsqueda, categorías y carrito móvil
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todos');
  const [cartOpen, setCartOpen] = useState(false);

  // ==========================================
  // 2. EFECTOS
  // ==========================================

  // A) Menú (compartido y en caché con el sitio público)
  useEffect(() => {
    loadMenu().then(setCevichesData).catch(e => console.error('Error fetching ceviches:', e));
  }, []);

  // B) Sesión guardada: verificar inventario inicial y cierre pendiente
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (localStorage.getItem('isLoggedIn') === 'true' && storedUserName) {
      startSession(storedUserName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Los avisos de error se ocultan solos (se muestran arriba, visibles también en el celular)
  useEffect(() => {
    if (!errors || !user) return;
    const timer = setTimeout(() => setErrors(null), 7000);
    return () => clearTimeout(timer);
  }, [errors, user]);

  // C) Totales del sistema: solo se cargan con el cierre abierto (que se hace una sola vez al día)
  useEffect(() => {
    if (!showCloseRegisterModal || !user?.name) return;
    fetchTodayOrders(user.name)
      .then(orders => setDailyTotals(sumTotals(orders)))
      .catch(e => console.error('Error fetching sales:', e));
  }, [showCloseRegisterModal, user?.name]);

  // Oculta el aviso de éxito después de 3 segundos
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Productos filtrados por categoría y búsqueda
  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cevichesData.filter(c =>
      (category === 'todos' || getCategory(c.name) === category) &&
      (!term || c.name.toLowerCase().includes(term))
    );
  }, [cevichesData, search, category]);

  // Cantidad de cada producto en el carrito (para el contador de las tarjetas)
  const inCartById = useMemo(() => order.reduce((acc, i) => {
    acc[i.cevicheId] = (acc[i.cevicheId] || 0) + i.quantity;
    return acc;
  }, {}), [order]);

  // Abre WhatsApp. Android/iPhone bloquean ventanas abiertas después de esperar a internet;
  // en ese caso se muestra un botón para enviarlo con un toque.
  const openWhatsApp = (link, title) => {
    const win = window.open(link, '_blank');
    if (!win) setPendingWhatsApp({ link, title });
  };

  // ==========================================
  // 3. SESIÓN
  // ==========================================

  const startSession = async (userName) => {
    setUser({ name: userName });
    try {
      // Si no ha enviado el inventario inicial de hoy, se pide primero
      setShowInventoryModal(!(await existsToday('daily_inventory_reports', userName)));
    } catch (error) {
      console.error('Error verificando inventario:', error);
      setShowInventoryModal(true);
    }
    try {
      // Si el cierre se abrió pero no se envió (ej. recargaron la página), se obliga a terminarlo
      if (await existsToday('closing_started', userName) && !(await existsToday('daily_closing_reports', userName))) {
        setInventoryDailyReport(createEmptyInventory());
        setShowCloseRegisterModal(true);
      }
    } catch (error) {
      console.error('Error verificando cierre pendiente:', error);
    }
  };

  const handleLogin = () => {
    const { name, password } = loginForm;
    if (VALID_USERS[name] && VALID_USERS[name] === password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name);
      setErrors(null);
      startSession(name);
    } else {
      setErrors('Credenciales incorrectas.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setUser(null);
  };

  // ==========================================
  // 4. CARRITO Y PEDIDO
  // ==========================================

  const handleAddToOrder = (product, size) => {
    setOrder(prev => addItemToOrder(prev, product, size, 1, { promoCorvina, promo16oz }));
    setErrors(null);
  };

  const handleChangeQuantity = (itemId, delta) => setOrder(prev => changeItemQuantity(prev, itemId, delta));

  const handleSendOrder = async () => {
    if (order.length === 0) {
      setErrors('El carrito está vacío.');
      return;
    }
    const total = orderTotal(order);

    // Si paga en efectivo y anotó con cuánto paga, debe alcanzar para el total
    const received = parseFloat(cashReceived);
    if (paymentMethod === 'Efectivo' && !isNaN(received) && received < total) {
      setErrors(`El monto recibido ($${received.toFixed(2)}) es menor que el total ($${total.toFixed(2)}).`);
      return;
    }
    setErrors(null);
    setLoading(true);

    let todayOrders;
    try {
      todayOrders = await fetchTodayOrders(user.name);
    } catch (e) {
      console.error('Error leyendo pedidos del día:', e);
      setErrors('No se pudieron leer los pedidos del día. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    // Avisar antes de mandar si parece un pedido repetido
    const duplicate = findPossibleDuplicate(todayOrders, order, total);
    if (duplicate) {
      setDuplicateWarning(duplicate);
      setLoading(false);
      return;
    }

    await submitOrder(false);
  };

  const submitOrder = async (isPossibleDuplicate) => {
    setDuplicateWarning(null);
    setLoading(true);

    const total = orderTotal(order);
    const received = parseFloat(cashReceived);
    const cashValue = paymentMethod === 'Efectivo' && !isNaN(received) ? received : null;

    try {
      await saveTodayDoc('orders', user.name, {
        items: order,
        total,
        isDelivery,
        isYappy: paymentMethod === 'Yappy',
        isCard: paymentMethod === 'Tarjeta',
        paymentMethod,
        promotionsUsed: { promoCorvina, promo16oz },
        possibleDuplicate: isPossibleDuplicate,
        cashReceived: cashValue,
        change: cashValue === null ? null : cashValue - total,
      });

      openWhatsApp(whatsappLink(buildOrderMessage({
        userName: user.name, order, total, paymentMethod, isDelivery, cashReceived: cashValue, isPossibleDuplicate,
      })), 'Pedido guardado');

      // Resetear
      setOrder([]);
      setIsDelivery(false);
      setPaymentMethod('Efectivo');
      setCashReceived('');
      setCartOpen(false);
      setSuccessMessage('✅ Pedido enviado con éxito');
    } catch (e) {
      console.error(e);
      setErrors('Error al guardar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 5. ENVASES RECIBIDOS
  // ==========================================

  const handleOpenReceipt = async () => {
    setReceiptForm(EMPTY_RECEIPT);
    setReceiptError(null);
    setShowReceiptModal(true);
    try {
      setReceiptsToday(sumReceipts(await fetchTodayReceipts(user.name)));
    } catch (e) {
      console.error('Error leyendo envases recibidos:', e);
    }
  };

  const handleSaveReceipt = async () => {
    const values = Object.fromEntries(CONTAINERS.map(({ key }) => [key, parseInt(receiptForm[key]) || 0]));
    if (Object.values(values).some(v => v < 0)) {
      setReceiptError('Las cantidades no pueden ser negativas.');
      return;
    }
    if (Object.values(values).every(v => v === 0)) {
      setReceiptError('Ingresa al menos una cantidad.');
      return;
    }
    try {
      await saveTodayDoc('container_receipts', user.name, values);
      setShowReceiptModal(false);
      setSuccessMessage('📦 Envases recibidos guardados');
    } catch (e) {
      console.error(e);
      setReceiptError('No se pudo guardar. Intenta de nuevo.');
    }
  };

  // ==========================================
  // 6. INVENTARIO INICIAL Y CIERRE DE CAJA
  // ==========================================

  const handleSendInventoryReport = async () => {
    if (formSending) return;
    const missing = findMissingInventory(inventoryDailyReport);
    setMissingFields(missing);
    if (missing.length > 0) {
      setInventoryModalError(`Falta llenar ${missing.length} ${missing.length === 1 ? 'campo' : 'campos'} (marcados en rojo): ${missing.map(getInventoryLabel).join(', ')}.`);
      scrollToField(missing[0]);
      return;
    }
    setFormSending(true);
    try {
      await saveTodayDoc('daily_inventory_reports', user.name, { inventory: inventoryDailyReport });
      openWhatsApp(whatsappLink(buildInventoryMessage({ userName: user.name, inventory: inventoryDailyReport })), 'Inventario guardado');
      setShowInventoryModal(false);
      setInventoryModalError(null);
    } catch (e) {
      console.error('Error inventario:', e);
      setInventoryModalError('Error al enviar: ' + e.message);
    } finally {
      setFormSending(false);
    }
  };

  // Abrir Cierre de Caja: solo una vez al día y con aviso previo
  const handleOpenClosing = async () => {
    if (checkingClosing) return;
    setCheckingClosing(true);
    setErrors(null);
    try {
      const [sentReport] = await fetchTodayDocs('daily_closing_reports', user.name);
      if (sentReport) {
        // Ya se cerró hoy: se ofrece reenviar el mensaje por si WhatsApp no se abrió la primera vez
        setPendingWhatsApp({
          title: 'El cierre de hoy ya fue enviado',
          text: 'Si el mensaje no le llegó a Sandra, puedes reenviarlo.',
          link: whatsappLink(buildClosingMessage({
            userName: user.name,
            systemTotals: sentReport.systemTotals,
            cashReported: sentReport.cashReported,
            containerCheck: sentReport.containerCheck || [],
            inventory: sentReport.finalInventory || {},
          })),
        });
        return;
      }
      setShowClosingConfirm(true);
    } catch (e) {
      console.error(e);
      setErrors('No se pudo verificar el cierre de caja. Revisa el internet e intenta de nuevo.');
    } finally {
      setCheckingClosing(false);
    }
  };

  const handleConfirmOpenClosing = async () => {
    setShowClosingConfirm(false);
    try {
      // Se registra la apertura para que, si recargan, el cierre vuelva a abrirse obligatoriamente
      await saveTodayDoc('closing_started', user.name, {});
      // El inventario final empieza vacío (no con los conteos de la mañana)
      setInventoryDailyReport(createEmptyInventory());
      setMissingFields([]);
      setShowCloseRegisterModal(true);
    } catch (e) {
      console.error(e);
      setErrors('No se pudo abrir el cierre de caja. Intenta de nuevo.');
    }
  };

  const handleSendClosingReport = async () => {
    if (formSending) return;
    setFormSending(true);
    try {
      const cashReported = parseFloat(closingRegisterReport.dinero);
      const missing = findMissingInventory(inventoryDailyReport);
      const cashMissing = closingRegisterReport.dinero === '' || closingRegisterReport.dinero == null || isNaN(cashReported) || cashReported < 0;
      setMissingFields(cashMissing ? ['dinero', ...missing] : missing);
      if (cashMissing) {
        setClosingModalError('Ingresa el dinero en caja.');
        scrollToField('dinero');
        return;
      }

      // Todo el inventario final debe estar lleno (los envases además son necesarios para el cuadre)
      if (missing.length > 0) {
        setClosingModalError(`Falta llenar ${missing.length} ${missing.length === 1 ? 'campo' : 'campos'} (marcados en rojo): ${missing.map(getInventoryLabel).join(', ')}.`);
        scrollToField(missing[0]);
        return;
      }

      // Evita enviar el cierre dos veces (doble clic)
      if (await existsToday('daily_closing_reports', user.name)) {
        setShowCloseRegisterModal(false);
        setErrors('El cierre de caja de hoy ya fue enviado.');
        return;
      }

      const [todayOrders, initialReports, receipts] = await Promise.all([
        fetchTodayOrders(user.name),
        fetchTodayDocs('daily_inventory_reports', user.name),
        fetchTodayReceipts(user.name),
      ]);
      const systemTotals = sumTotals(todayOrders);
      const initialInventory = initialReports[0]?.inventory || {};
      const containerCheck = buildContainerCheck(initialInventory, inventoryDailyReport, todayOrders, sumReceipts(receipts));

      await saveTodayDoc('daily_closing_reports', user.name, {
        cashReported,
        systemTotals,
        difference: cashReported - systemTotals.efectivo,
        containerCheck,
        finalInventory: inventoryDailyReport,
      });

      openWhatsApp(whatsappLink(buildClosingMessage({
        userName: user.name, systemTotals, cashReported, containerCheck, inventory: inventoryDailyReport,
      })), 'Cierre de caja guardado');
      setShowCloseRegisterModal(false);
      setClosingModalError(null);
    } catch (e) {
      console.error(e);
      setClosingModalError('No se pudo enviar el cierre. Revisa el internet e intenta de nuevo.');
    } finally {
      setFormSending(false);
    }
  };

  // ==========================================
  // 7. RENDERS
  // ==========================================

  // A) Pantalla de Login
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-orange-50">
        <form onSubmit={e => { e.preventDefault(); handleLogin(); }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-orange-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">Ceviche Sandra</h2>
          <input type="text" placeholder="Usuario" autoComplete="username" className="w-full mb-3 p-3 border rounded-xl" value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })} />
          <input type="password" placeholder="Contraseña" autoComplete="current-password" className="w-full mb-6 p-3 border rounded-xl" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          {errors && <p className="text-red-500 text-sm text-center mb-4">{errors}</p>}
          <button type="submit" className="bg-orange-500 text-white px-4 py-3 rounded-xl w-full font-bold hover:bg-orange-600 transition">Iniciar Sesión</button>
        </form>
      </div>
    );
  }

  // B) Inventario Inicial
  if (showInventoryModal) {
    return <InventoryTextForm
              inventoryDailyReport={inventoryDailyReport}
              setInventoryDailyReport={setInventoryDailyReport}
              onSubmit={handleSendInventoryReport}
              error={inventoryModalError}
              submitting={formSending}
              missingFields={missingFields}
           />;
  }

  // C) Cierre Caja
  if (showCloseRegisterModal) {
    return <InventoryTextForm
              inventoryDailyReport={inventoryDailyReport}
              setInventoryDailyReport={setInventoryDailyReport}
              onSubmit={handleSendClosingReport}
              error={closingModalError}
              submitting={formSending}
              missingFields={missingFields}
              isClosingReport={true}
              dailyTotals={dailyTotals}
              setClosingRegisterReport={setClosingRegisterReport}
           />;
  }

  // D) RENDER PRINCIPAL
  const grandTotal = orderTotal(order);
  const itemCount = order.reduce((sum, item) => sum + item.quantity, 0);
  const cashValue = parseFloat(cashReceived);
  const hasCash = cashReceived !== '' && !isNaN(cashValue);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* BARRA SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 md:mr-96">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-black text-gray-800 leading-tight">Ventas</h1>
            <p className="text-xs text-orange-600 font-semibold truncate">{user.name}</p>
          </div>
          {/* Botones grandes y con texto también en el celular (fáciles de tocar) */}
          <div className="flex items-stretch gap-1.5 sm:gap-2">
            <button onClick={handleOpenReceipt} className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 min-w-[58px] min-h-[48px] px-2 sm:px-3 py-1.5 text-[11px] sm:text-sm font-semibold text-gray-700 bg-gray-100 active:bg-gray-300 hover:bg-gray-200 rounded-xl" aria-label="Envases recibidos">
              <FaBoxOpen size={18} /> <span><span className="sm:hidden">Envases</span><span className="hidden sm:inline">Recibí envases</span></span>
            </button>
            <button onClick={handleOpenClosing} disabled={checkingClosing} className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 min-w-[58px] min-h-[48px] px-2 sm:px-3 py-1.5 text-[11px] sm:text-sm font-bold text-white bg-orange-500 active:bg-orange-700 hover:bg-orange-600 disabled:opacity-60 rounded-xl" aria-label="Cierre de caja">
              <FaCashRegister size={18} /> <span>{checkingClosing ? '...' : 'Cierre'}</span>
            </button>
            <button onClick={handleLogout} className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 min-w-[52px] min-h-[48px] px-2 sm:px-3 py-1.5 text-[11px] sm:text-sm font-semibold text-red-600 bg-red-50 active:bg-red-200 hover:bg-red-100 rounded-xl" aria-label="Salir">
              <FaSignOutAlt size={18} /> <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Búsqueda y categorías */}
        <div className="px-4 pb-3 space-y-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="search"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 outline-none bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {MENU_CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition ${category === c.key ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
              >
                {c.label}
              </button>
            ))}
            <span className="hidden sm:block w-px bg-gray-200 mx-1" />
            {/* Promociones del día */}
            <button
              onClick={() => setPromoCorvina(!promoCorvina)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition ${promoCorvina ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
              title="Cóctel Corvina 16oz a $5.50"
            >
              <FaTag size={11} /> Corvina $5.50
            </button>
            <button
              onClick={() => setPromo16oz(!promo16oz)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition ${promo16oz ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
              title="-$1.00 en todos los 16oz"
            >
              <FaTag size={11} /> -$1 en 16oz
            </button>
          </div>
        </div>
      </header>

      {/* PRODUCTOS */}
      <main className={`p-4 ${order.length > 0 ? 'pb-48' : 'pb-32'} md:pb-6 md:mr-96`}>
        {cevichesData.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Cargando menú...</p>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No hay productos que coincidan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {visibleProducts.map((ceviche) => {
              const sizes = Object.keys(ceviche.prices);
              const inCart = inCartById[ceviche.id] || 0;
              return (
                <div key={ceviche.id} className={`bg-white rounded-xl border shadow-sm flex overflow-hidden ${inCart > 0 ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-100'}`}>
                  <div className="w-24 sm:w-28 shrink-0 bg-gray-100 relative">
                    <img src={getMainImage(ceviche.image)} alt={ceviche.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    {inCart > 0 && (
                      <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-bold rounded-full h-6 min-w-6 px-1.5 flex items-center justify-center">{inCart}</span>
                    )}
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 leading-tight mb-2">{ceviche.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.map(size => {
                        const hasPromo = size === '16oz' && (promo16oz || (promoCorvina && (ceviche.id == 10 || ceviche.name === "Cóctel Corvina")));
                        return (
                          <button
                            key={size}
                            onClick={() => handleAddToOrder(ceviche, size)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border active:scale-95 transition ${hasPromo ? 'bg-yellow-50 border-yellow-400 text-yellow-900 hover:bg-yellow-100' : 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100'}`}
                          >
                            {sizes.length === 1 && size === '1' ? 'Agregar' : size} · ${Number(ceviche.prices[size]).toFixed(2)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Fondo oscuro del carrito en móvil */}
      {cartOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setCartOpen(false)} />}

      {/* CARRITO: panel lateral en escritorio, hoja inferior en móvil */}
      <aside className={`fixed z-50 bg-white flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.12)] md:shadow-[-4px_0_20px_rgba(0,0,0,0.06)]
        left-0 right-0 bottom-0 rounded-t-2xl md:rounded-none
        md:top-0 md:left-auto md:w-96 md:h-screen
        ${cartOpen ? 'max-h-[85vh] supports-[height:100dvh]:max-h-[85dvh]' : 'max-h-none'} md:max-h-none`}>

        {/* Encabezado del carrito (en móvil abre/cierra) */}
        <button onClick={() => setCartOpen(!cartOpen)} className="md:cursor-default p-4 bg-orange-600 text-white flex justify-between items-center rounded-t-2xl md:rounded-none">
          <span className="font-bold text-lg flex items-center gap-2">
            Pedido <span className="text-sm bg-white/20 px-2 py-0.5 rounded">{itemCount}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-xl font-black">${grandTotal.toFixed(2)}</span>
            <span className="md:hidden">{cartOpen ? <FaChevronDown /> : <FaChevronUp />}</span>
          </span>
        </button>

        {/* Carrito cerrado con productos: botón grande para ir a enviar (solo móvil) */}
        {!cartOpen && order.length > 0 && (
          <button onClick={() => setCartOpen(true)} className="md:hidden m-3 py-3.5 rounded-xl font-bold text-white bg-green-600 active:bg-green-700 shadow-lg flex items-center justify-center gap-2">
            <FaWhatsapp size={20}/> Revisar y enviar pedido
          </button>
        )}

        <div className={`${cartOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-h-0`}>
          {/* Zona con scroll: productos y forma de pago. El botón de enviar queda fijo abajo */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {/* Lista de Items */}
          <div className="p-3 space-y-2 bg-gray-50 min-h-[80px]">
            {order.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Toca un tamaño para agregarlo</p>
            ) : (
              order.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{item.cevicheName}</p>
                    <p className="text-xs text-gray-500">{item.size !== '1' ? `${item.size} · ` : ''}${item.price.toFixed(2)} c/u</p>
                    {item.originalPrice !== item.price && (
                      <p className="text-[10px] text-gray-400 line-through">Antes: ${item.originalPrice.toFixed(2)}</p>
                    )}
                    {item.promos && <p className="text-[10px] text-green-600 font-bold">🏷️ {item.promos}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-bold text-orange-600 text-sm">${item.subtotal.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleChangeQuantity(item.id, -1)} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600" title={item.quantity === 1 ? 'Quitar' : 'Menos'}>
                        {item.quantity === 1 ? <FaTrash size={11} className="text-red-500" /> : <FaMinus size={10} />}
                      </button>
                      <span className="w-7 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => handleChangeQuantity(item.id, 1)} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600" title="Más">
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pago y envío */}
          <div className="p-3 bg-white border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_OPTIONS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPaymentMethod(p.key)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-semibold transition ${paymentMethod === p.key ? p.active : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm font-semibold ${isDelivery ? 'bg-orange-50 border-orange-300 text-orange-800' : 'border-gray-200 text-gray-600'}`}>
              <input type="checkbox" checked={isDelivery} onChange={() => setIsDelivery(!isDelivery)} className="accent-orange-500 w-4 h-4" />
              <FaMotorcycle /> Delivery
            </label>

            {/* Monto Recibido y Cambio (solo efectivo) */}
            {paymentMethod === 'Efectivo' && order.length > 0 && (
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600 font-semibold whitespace-nowrap">Paga con $</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}                    className="w-24 p-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 outline-none"
                  />
                  {hasCash && (
                    cashValue >= grandTotal
                      ? <span className="ml-auto text-base font-black text-green-700">Cambio ${(cashValue - grandTotal).toFixed(2)}</span>
                      : <span className="ml-auto text-xs font-bold text-red-600">Faltan ${(grandTotal - cashValue).toFixed(2)}</span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setCashReceived(grandTotal.toFixed(2))} className="flex-1 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold">Exacto</button>
                  {QUICK_CASH.filter(v => v >= grandTotal).map(v => (
                    <button key={v} onClick={() => setCashReceived(String(v))} className="flex-1 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold">${v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Botón de enviar: siempre visible al fondo del carrito */}
          <div className="shrink-0 p-3 bg-white border-t border-gray-200" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <button onClick={handleSendOrder} disabled={order.length === 0 || loading} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition ${order.length === 0 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-[0.99]'}`}>
              {loading ? 'Enviando...' : <><FaWhatsapp size={20}/> Confirmar Pedido · ${grandTotal.toFixed(2)}</>}
            </button>

          </div>
        </div>
      </aside>

      {showReceiptModal && (
        <ReceiptModal
          form={receiptForm}
          setForm={setReceiptForm}
          receivedToday={receiptsToday}
          error={receiptError}
          onCancel={() => setShowReceiptModal(false)}
          onSave={handleSaveReceipt}
        />
      )}

      {showClosingConfirm && (
        <ClosingConfirmModal onCancel={() => setShowClosingConfirm(false)} onConfirm={handleConfirmOpenClosing} />
      )}

      {duplicateWarning && (
        <DuplicateOrderModal duplicate={duplicateWarning} onCancel={() => setDuplicateWarning(null)} onConfirm={() => submitOrder(true)} />
      )}

      {pendingWhatsApp && (
        <WhatsAppFallbackModal pending={pendingWhatsApp} onClose={() => setPendingWhatsApp(null)} />
      )}

      {successMessage && <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[25rem] bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-[120] font-semibold">{successMessage}</div>}

      {/* Avisos de error arriba: visibles aunque el carrito esté cerrado en el celular */}
      {errors && (
        <div role="alert" className="fixed top-4 left-4 right-4 md:left-auto md:right-[25rem] md:max-w-md bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl z-[120] font-semibold flex items-start gap-3">
          <span className="flex-1">{errors}</span>
          <button onClick={() => setErrors(null)} className="text-white/80 hover:text-white text-xl leading-none" aria-label="Cerrar aviso">×</button>
        </div>
      )}
    </div>
  );
};

export default CevicheVenta;
