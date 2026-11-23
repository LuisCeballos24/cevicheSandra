import { useState, useEffect, useMemo } from 'react';
import { db } from './FirebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import InventoryTextForm from './InventoryTextForm';
import { fetchTodayOrders, sumTotals, buildContainerCheck, CONTAINERS, sumReceipts, fetchTodayReceipts } from './ventasUtils';
import { FaTrash, FaSignOutAlt, FaCashRegister, FaWhatsapp, FaTag, FaCreditCard, FaBoxOpen, FaSearch, FaPlus, FaMinus, FaChevronUp, FaChevronDown, FaMoneyBillWave, FaMobileAlt, FaMotorcycle } from 'react-icons/fa';

// Minutos hacia atrás en los que un pedido idéntico se considera posible repetición
const DUPLICATE_WINDOW_MINUTES = 10;

const EMPTY_RECEIPT = { envases16oz: '', envases24oz: '', vasos7oz: '' };

// Categorías del menú (por nombre del producto)
const CATEGORIES = [
  { key: 'todos', label: 'Todos' },
  { key: 'ceviches', label: 'Ceviches' },
  { key: 'cocteles', label: 'Cócteles' },
  { key: 'extras', label: 'Extras' },
];

const getCategory = (name = '') => {
  const n = name.toLowerCase();
  if (n.startsWith('ceviche')) return 'ceviches';
  if (n.startsWith('cóctel') || n.startsWith('coctel')) return 'cocteles';
  return 'extras';
};

// Primera imagen del producto (puede ser string u objeto con varias)
const getMainImage = (image) => (typeof image === 'string' ? image : Object.values(image || {})[0]);

// Billetes rápidos para "Paga con"
const QUICK_CASH = [5, 10, 20, 50];

// Verifica si el usuario ya tiene un documento hoy en la colección dada
const existsToday = async (collectionName, userName) => {
  const q = query(
    collection(db, collectionName),
    where('user', '==', userName),
    where('date', '==', new Date().toDateString())
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Firma de los items (sin importar el orden) para comparar pedidos
const itemsSignature = (items = []) =>
  items.map(i => `${i.cevicheName}|${i.size}|${i.quantity}`).sort().join(';');

// Busca un pedido idéntico enviado en los últimos minutos
const findPossibleDuplicate = (orders, items, total) => {
  const signature = itemsSignature(items);
  const limit = Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000;
  return orders.find(o => {
    const time = o.timestamp?.toDate ? o.timestamp.toDate().getTime() : 0;
    return time >= limit
      && Math.abs((parseFloat(o.total) || 0) - total) < 0.01
      && itemsSignature(o.items) === signature;
  });
};

const CevicheVenta = () => {
  // ==========================================
  // 1. ESTADOS (STATES)
  // ==========================================
  
  // Datos y Carrito
  const [cevichesData, setCevichesData] = useState([]);
  const [order, setOrder] = useState([]);
  
  // Promociones Activas
  const [promoCorvina, setPromoCorvina] = useState(false);
  const [promo16oz, setPromo16oz] = useState(false);

  // Usuario y Sesión
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  
  // UI y Modales
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
  
  // Opciones de Pedido (Métodos de Pago)
  const [isDelivery, setIsDelivery] = useState(false);
  const [isYappy, setIsYappy] = useState(false);
  const [isCard, setIsCard] = useState(false); // <--- NUEVO ESTADO PARA TARJETA
  const [cashReceived, setCashReceived] = useState(''); // Monto con el que paga el cliente (efectivo)

  // Inventario y Reportes
  const [inventoryDailyReport, setInventoryDailyReport] = useState({});
  const [inventoryReportSent, setInventoryReportSent] = useState(false);
  const [inventoryModalError, setInventoryModalError] = useState(null);
  
  // Cierre de Caja (los totales del sistema solo se ven dentro del cierre)
  const [dailyTotals, setDailyTotals] = useState({ efectivo: 0, yappy: 0, tarjeta: 0 });
  const [closingRegisterReport, setClosingRegisterReport] = useState({ dinero: '' });
  const [closingModalError, setClosingModalError] = useState(null);
  const [showClosingConfirm, setShowClosingConfirm] = useState(false);

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

  // Usuarios Válidos
  const validUsers = {
    cevicheSandra: 'Ceviche.sandra@24',
    cevicheAltos: 'Altos.ceviche@24',
    cevichePraderas: 'Praderas.ceviche@24',
  };

  // ==========================================
  // 2. EFECTOS (USE EFFECTS)
  // ==========================================

  // A) Cargar Datos JSON e Inicializar Inventario
  useEffect(() => {
    const fetchCeviches = async () => {
      try {
        const response = await fetch('/cevichesData.json');
        const data = await response.json();
        setCevichesData(data);

        // Estructura Base del Inventario
        const initialCevicheState = { 
            galonLleno: false, galonMedio: false, galonMedioLleno: false, galonUnCuarto: false, noHay: false 
        };

        const initialReport = {
            // Insumos
            nachosGrande: '', nachosPequeno: '', vasos7oz: '', cucharas: false, bolsitas5x10: false,
            sodas: '', platanitos: '', envases16oz: '', envases24oz: '', uvas: false,
            kiwi: false, coco: false, pina: false, nachosSinPreparar: false, vuelto: false,
            // Ceviches
            cevicheTradicionalCorvina: { ...initialCevicheState },
            coctelCorvina: { ...initialCevicheState },
            cevicheCamaron: { ...initialCevicheState },
            cevicheLangostino: { ...initialCevicheState },
            cevicheMixto: { ...initialCevicheState },
            cevicheConchaNegra: { ...initialCevicheState },
            cevichePulpo: { ...initialCevicheState },
            cevicheCombinacion: { ...initialCevicheState },
        };
        setInventoryDailyReport(initialReport);

      } catch (error) {
        console.error('Error fetching ceviches:', error);
      }
    };
    fetchCeviches();
  }, []);

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

  // B) Verificar Sesión e Inventario Diario
  useEffect(() => {
    const checkSessionAndInventory = async () => {
      const session = localStorage.getItem('isLoggedIn');
      const storedUserName = localStorage.getItem('userName');
      const todayDateString = new Date().toDateString();

      if (session === 'true' && storedUserName) {
        setUser({ name: storedUserName });
        setIsLoggedIn(true);

        try {
          const q = query(
            collection(db, 'daily_inventory_reports'),
            where('user', '==', storedUserName),
            where('date', '==', todayDateString)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setInventoryReportSent(true);
            setShowInventoryModal(false);
          } else {
            setInventoryReportSent(false);
            setShowInventoryModal(true);
          }
        } catch (error) {
          console.error("Error verificando inventario:", error);
          setShowInventoryModal(true);
        }

        await checkPendingClosing(storedUserName);
      }
    };
    checkSessionAndInventory();
  }, []);

  // C) Totales del sistema: solo se cargan con el cierre abierto (que se hace una sola vez al día)
  useEffect(() => {
    const fetchDailySales = async () => {
      if (showCloseRegisterModal && user?.name) {
        try {
          setDailyTotals(sumTotals(await fetchTodayOrders(user.name)));
        } catch (error) {
          console.error("Error fetching sales:", error);
        }
      }
    };
    fetchDailySales();
  }, [showCloseRegisterModal, user?.name]);


  // ==========================================
  // 3. HANDLERS (LOGICA)
  // ==========================================

  // Si el cierre se abrió pero no se envió (ej. recargaron la página), se obliga a terminarlo
  const checkPendingClosing = async (userName) => {
    try {
      const started = await existsToday('closing_started', userName);
      if (started && !(await existsToday('daily_closing_reports', userName))) {
        setShowCloseRegisterModal(true);
      }
    } catch (error) {
      console.error("Error verificando cierre pendiente:", error);
    }
  };

  const handleLogin = () => {
    const { name, password } = loginForm;
    if (validUsers[name] && validUsers[name] === password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name);
      setUser({ name });
      setIsLoggedIn(true);
      setErrors(null);
      checkPendingClosing(name);
    } else {
      setErrors('Credenciales incorrectas.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUser(null);
  };

  // --- [CORREGIDO AQUÍ] LÓGICA PRINCIPAL DE PRECIOS Y PROMOCIONES ---
  const handleAddToOrder = (cevicheId, size, quantity) => {
    if (!size || quantity <= 0) {
      setErrors('Selecciona un tamaño y cantidad válidos.');
      return;
    }
    const ceviche = cevichesData.find(c => c.id === cevicheId);
    
    // Parseamos a número para asegurar comparaciones
    const originalPrice = parseFloat(ceviche.prices[size]);
    let finalPrice = originalPrice; 
    let appliedPromos = [];

    // [CORRECCIÓN]: Comparamos con ID 10 (según tu JSON) o el nombre exacto
    // Antes tenías (cevicheId == 8), por eso fallaba.
    const isCoctelCorvina = (cevicheId == 10 || ceviche.name === "Cóctel Corvina");

    // 1. Promo Corvina ($5.50) - PRIORIDAD 1
    if (promoCorvina && isCoctelCorvina && size === '16oz') {
        finalPrice = 5.50;
        appliedPromos.push("Promo Corvina ($5.50)");
    } 
    // 2. Promo General (-$1.00) - Solo si no entró en la primera
    else if (promo16oz && size === '16oz') {
        finalPrice = finalPrice - 1.00;
        appliedPromos.push("-1$ 16oz");
    }

    const qty = parseInt(quantity);
    const promos = appliedPromos.join(', ');

    setOrder(prev => {
      // Mismo producto, tamaño y precio: se suma la cantidad en la misma línea
      const existing = prev.find(i => i.cevicheId === cevicheId && i.size === size && i.price === finalPrice && i.promos === promos);
      if (existing) {
        return prev.map(i => i.id === existing.id
          ? { ...i, quantity: i.quantity + qty, subtotal: i.price * (i.quantity + qty) }
          : i);
      }
      return [...prev, {
        id: `${cevicheId}-${size}-${Date.now()}`,
        cevicheId,
        cevicheName: ceviche.name,
        size,
        quantity: qty,
        originalPrice: originalPrice,
        price: finalPrice, // AQUÍ SE GUARDA EL PRECIO YA CON DESCUENTO
        subtotal: finalPrice * qty,
        promos
      }];
    });
    setErrors(null);
  };

  const handleRemoveFromOrder = (itemId) => {
    setOrder(prev => prev.filter(item => item.id !== itemId));
  };

  // +/- en el carrito; en 0 se elimina la línea
  const handleChangeQuantity = (itemId, delta) => {
    setOrder(prev => prev
      .map(i => i.id === itemId ? { ...i, quantity: i.quantity + delta, subtotal: i.price * (i.quantity + delta) } : i)
      .filter(i => i.quantity > 0));
  };

  const handlePaymentMethod = (method) => {
    setIsYappy(method === 'Yappy');
    setIsCard(method === 'Tarjeta');
  };

  // Envases recibidos: se guardan aparte y se suman al cuadre del cierre
  const handleOpenReceipt = async () => {
    setReceiptForm(EMPTY_RECEIPT);
    setReceiptError(null);
    setShowReceiptModal(true);
    try {
      setReceiptsToday(sumReceipts(await fetchTodayReceipts(user.name)));
    } catch (e) {
      console.error("Error leyendo envases recibidos:", e);
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
      await addDoc(collection(db, 'container_receipts'), {
        user: user.name,
        date: new Date().toDateString(),
        ...values,
        timestamp: new Date()
      });
      setShowReceiptModal(false);
      setSuccessMessage('📦 Envases recibidos guardados');
    } catch (e) {
      console.error(e);
      setReceiptError('No se pudo guardar. Intenta de nuevo.');
    }
  };

  // Enviar Pedido (WhatsApp + Firebase)
  // Al corregir handleAddToOrder, 'order' ya tiene los precios correctos,
  // así que esta función enviará los totales con descuento automáticamente.
  const handleSendOrder = async () => {
    if (order.length === 0) {
      setErrors('El carrito está vacío.');
      return;
    }
    const total = order.reduce((sum, item) => sum + item.subtotal, 0);

    // Si paga en efectivo y anotó con cuánto paga, debe alcanzar para el total
    const received = parseFloat(cashReceived);
    if (!isYappy && !isCard && !isNaN(received) && received < total) {
      setErrors(`El monto recibido ($${received.toFixed(2)}) es menor que el total ($${total.toFixed(2)}).`);
      return;
    }
    setErrors(null);
    setLoading(true);

    let todayOrders = [];
    try {
      todayOrders = await fetchTodayOrders(user.name);
    } catch (e) {
      console.error("Error leyendo pedidos del día:", e);
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

    const total = order.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryText = isDelivery ? 'Sí' : 'No';
    
    // Lógica Texto Método de Pago
    let paymentMethod = 'Efectivo';
    let yappyText = 'No';
    let cardText = 'No';

    if (isYappy) {
        paymentMethod = 'Yappy';
        yappyText = 'Sí';
    } else if (isCard) {
        paymentMethod = 'Tarjeta';
        cardText = 'Sí';
    }
    
    const itemsText = order.map(item => {
        const promoText = item.promos ? ` (Promos: ${item.promos})` : '';
        // item.subtotal ya tiene el descuento aplicado
        return `• ${item.quantity}x ${item.cevicheName} (${item.size}) - $${item.subtotal.toFixed(2)}${promoText}`;
    }).join('\n');
    
    const duplicateText = isPossibleDuplicate ? `⚠️ *POSIBLE PEDIDO REPETIDO* ⚠️\n` : '';

    // Monto recibido y cambio (solo efectivo)
    const received = parseFloat(cashReceived);
    const hasCashReceived = paymentMethod === 'Efectivo' && !isNaN(received);
    const change = hasCashReceived ? received - total : null;
    const changeText = hasCashReceived ? `\nPaga con: $${received.toFixed(2)}\n*Cambio: $${change.toFixed(2)}*` : '';

    // Mensaje WhatsApp
    const whatsappMsg = `${duplicateText}*¡Nuevo Pedido!*\nUser: ${user.name}\n\n${itemsText}\n\n*Total: $${total.toFixed(2)}*${changeText}\nDelivery: ${deliveryText}\nYappy: ${yappyText}\nTarjeta: ${cardText}`;
    const whatsappLink = `https://wa.me/50767961550?text=${encodeURIComponent(whatsappMsg)}`;

    try {
      await addDoc(collection(db, 'orders'), {
        user: user.name,
        items: order, 
        total: total, 
        isDelivery,
        isYappy,
        isCard, 
        paymentMethod,
        promotionsUsed: { promoCorvina, promo16oz },
        possibleDuplicate: isPossibleDuplicate,
        cashReceived: hasCashReceived ? received : null,
        change,
        timestamp: new Date()
      });

      window.open(whatsappLink, '_blank');
      
      // Resetear
      setOrder([]);
      setIsDelivery(false);
      setIsYappy(false);
      setIsCard(false);
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

  // Enviar Reporte Inventario Inicial
  const handleSendInventoryReport = async () => {
      try {
        let inventoryText = "";
        for (const [key, value] of Object.entries(inventoryDailyReport)) {
             let name = key; 
             const cevicheFound = cevichesData.find(c => c.id === key);
             if (cevicheFound) name = cevicheFound.name;

             if (typeof value === 'object' && value !== null) {
                 let level = "Sin marcar";
                 if (value.galonLleno) level = "Galón Lleno (4/4)";
                 else if (value.galonMedioLleno) level = "Casi Lleno (3/4)";
                 else if (value.galonMedio) level = "Medio Galón (2/4)";
                 else if (value.galonUnCuarto) level = "Un Cuarto (1/4)";
                 else if (value.noHay) level = "VACÍO";
                   let receivedMsg = "";
                 if (value.receivedQuantity && value.receivedQuantity > 0) {
                    receivedMsg = ` | 📦 Recibió: ${value.receivedQuantity} ${value.receivedQuantity === 1 ? 'gln' : 'glns'}`;
                 }

                 // 3. Concatenar
                 inventoryText += `\n- ${name}: ${level}${receivedMsg}`;
             } else if (typeof value === 'boolean') {
                 inventoryText += `\n- ${name}: ${value ? 'NO HAY' : 'Sí hay'}`;
             } else {
                 inventoryText += `\n- ${name}: ${value || '0'}`;
             }
        }

        const msg = `*¡Reporte de Inventario Inicial!* 🌅\n*Usuario:* ${user.name}\n*Fecha:* ${new Date().toLocaleDateString()}\n\n*DETALLES:*${inventoryText}`;
        const link = `https://wa.me/50767961550?text=${encodeURIComponent(msg)}`;

        await addDoc(collection(db, 'daily_inventory_reports'), { 
            user: user.name, 
            date: new Date().toDateString(), 
            inventory: inventoryDailyReport, 
            timestamp: new Date() 
        });

        window.open(link, '_blank');
        setInventoryReportSent(true);
        setShowInventoryModal(false);
        setInventoryModalError(null);
      } catch (e) { 
          console.error("Error inventario:", e);
          setInventoryModalError("Error al enviar: " + e.message); 
      }
  };

  // Abrir Cierre de Caja: solo una vez al día y con aviso previo
  const handleOpenClosing = async () => {
    try {
      if (await existsToday('daily_closing_reports', user.name)) {
        setErrors('El cierre de caja de hoy ya fue enviado.');
        return;
      }
      setErrors(null);
      setShowClosingConfirm(true);
    } catch (e) {
      console.error(e);
      setErrors('No se pudo verificar el cierre de caja. Intenta de nuevo.');
    }
  };

  const handleConfirmOpenClosing = async () => {
    try {
      // Se registra la apertura para que, si recargan, el cierre vuelva a abrirse obligatoriamente
      await addDoc(collection(db, 'closing_started'), {
        user: user.name,
        date: new Date().toDateString(),
        timestamp: new Date()
      });
      setShowClosingConfirm(false);
      setShowCloseRegisterModal(true);
    } catch (e) {
      console.error(e);
      setShowClosingConfirm(false);
      setErrors('No se pudo abrir el cierre de caja. Intenta de nuevo.');
    }
  };

  // Enviar Reporte Cierre de Caja
  const handleSendClosingReport = async () => {
     try {
         if (closingRegisterReport.dinero === '' || isNaN(parseFloat(closingRegisterReport.dinero))) {
             setClosingModalError("Ingresa el dinero en caja.");
             return;
         }
         const cashReported = parseFloat(closingRegisterReport.dinero);

         // Los envases son necesarios para el cuadre
         const missingContainers = CONTAINERS.filter(c => inventoryDailyReport[c.key] === '' || isNaN(parseInt(inventoryDailyReport[c.key])));
         if (missingContainers.length > 0) {
             setClosingModalError(`Ingresa la cantidad de envases: ${missingContainers.map(c => c.label).join(', ')}.`);
             return;
         }

         // Evita enviar el cierre dos veces (doble clic)
         if (await existsToday('daily_closing_reports', user.name)) {
             setShowCloseRegisterModal(false);
             setErrors('El cierre de caja de hoy ya fue enviado.');
             return;
         }

         const todayOrders = await fetchTodayOrders(user.name);
         const systemTotals = sumTotals(todayOrders);
         const diff = cashReported - systemTotals.efectivo;

         // Cuadre de envases contra el inventario inicial del día
         const initialSnapshot = await getDocs(query(
             collection(db, 'daily_inventory_reports'),
             where('user', '==', user.name),
             where('date', '==', new Date().toDateString())
         ));
         const initialInventory = initialSnapshot.empty ? {} : (initialSnapshot.docs[0].data().inventory || {});
         const received = sumReceipts(await fetchTodayReceipts(user.name));
         const containerCheck = buildContainerCheck(initialInventory, inventoryDailyReport, todayOrders, received);
         const containerText = containerCheck.map(c => {
             if (c.usados === null) return `\n- ${c.label}: sin conteo de apertura (vendidos ${c.vendidos})`;
             const status = c.faltan === 0 ? '✅ Cuadra' : c.faltan > 0 ? `⚠️ Faltan ${c.faltan}` : `⚠️ Sobran ${-c.faltan}`;
             const receivedText = c.recibidos > 0 ? `, recibió ${c.recibidos}` : '';
             return `\n- ${c.label}: abrió ${c.apertura}${receivedText}, cerró ${c.cierre} → usados ${c.usados} | reportados ${c.vendidos} → ${status}`;
         }).join('');

         let inventoryText = "";
         // Generación de texto de inventario (reutilizada)
         for (const [key, value] of Object.entries(inventoryDailyReport)) {
             let name = key;
             const ceviche = cevichesData.find(c => c.id === key);
             if (ceviche) name = ceviche.name;

             if (typeof value === 'object' && value !== null) {
                 let level = "Sin marcar";
                 if (value.galonLleno) level = "Galón Lleno (4/4)";
                 else if (value.galonMedioLleno) level = "Casi Lleno (3/4)";
                 else if (value.galonMedio) level = "Medio Galón (2/4)";
                 else if (value.galonUnCuarto) level = "Un Cuarto (1/4)";
                 else if (value.noHay) level = "VACÍO";
                 inventoryText += `\n- ${name}: ${level}`;
             } else if (typeof value === 'boolean') {
                 inventoryText += `\n- ${name}: ${value ? 'NO HAY' : 'Sí hay'}`;
             } else {
                 inventoryText += `\n- ${name}: ${value || '0'}`;
             }
         }

         // Mensaje Cierre (Incluye Tarjeta)
         const msg = `*Cierre de Caja - ${user.name}*\nFecha: ${new Date().toLocaleDateString()}\n\n*DINERO:*\n- Sistema (Efectivo): $${systemTotals.efectivo.toFixed(2)}\n- Sistema (Yappy): $${systemTotals.yappy.toFixed(2)}\n- Sistema (Tarjeta): $${systemTotals.tarjeta.toFixed(2)}\n----------------\n- En Caja (Efectivo Real): $${cashReported.toFixed(2)}\n- Diferencia Efectivo: $${diff.toFixed(2)}\n\n*CUADRE DE ENVASES:*${containerText}\n\n*INVENTARIO FINAL:*${inventoryText}`;
         const link = `https://wa.me/50767961550?text=${encodeURIComponent(msg)}`;
         
         await addDoc(collection(db, 'daily_closing_reports'), { 
             user: user.name, 
             date: new Date().toDateString(), 
             cashReported, 
             systemTotals,
             difference: diff,
             containerCheck,
             finalInventory: inventoryDailyReport,
             timestamp: new Date() 
         });
         
         window.open(link, '_blank');
         setShowCloseRegisterModal(false);
         setClosingModalError(null);
     } catch (e) { setClosingModalError(e.message); }
  };


  // ==========================================
  // 4. RENDERS (UI)
  // ==========================================

  // A) Pantalla de Login
  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-orange-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-orange-100">
          <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">Ceviche Sandra</h2>
          <input type="text" placeholder="Usuario" className="w-full mb-3 p-3 border rounded-xl" value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })} />
          <input type="password" placeholder="Contraseña" className="w-full mb-6 p-3 border rounded-xl" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
          {errors && <p className="text-red-500 text-sm text-center mb-4">{errors}</p>}
          <button onClick={handleLogin} className="bg-orange-500 text-white px-4 py-3 rounded-xl w-full font-bold hover:bg-orange-600 transition">Iniciar Sesión</button>
        </div>
      </div>
    );
  }

  // B) Modal Inventario Inicial
  if (showInventoryModal && !inventoryReportSent) {
      return <InventoryTextForm 
                inventoryDailyReport={inventoryDailyReport} 
                setInventoryDailyReport={setInventoryDailyReport} 
                onSubmit={handleSendInventoryReport} 
                error={inventoryModalError} 
             />;
  }

  // C) Modal Cierre Caja
  if (showCloseRegisterModal) {
      return <InventoryTextForm 
                inventoryDailyReport={inventoryDailyReport} 
                setInventoryDailyReport={setInventoryDailyReport} 
                onSubmit={handleSendClosingReport} 
                error={closingModalError} 
                isClosingReport={true}
                dailyTotals={dailyTotals}
                setClosingRegisterReport={setClosingRegisterReport} 
             />;
  }

  // D) RENDER PRINCIPAL (APP)
  const grandTotal = order.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = order.reduce((sum, item) => sum + item.quantity, 0);
  const paymentMethod = isYappy ? 'Yappy' : isCard ? 'Tarjeta' : 'Efectivo';
  const cashValue = parseFloat(cashReceived);
  const hasCash = cashReceived !== '' && !isNaN(cashValue);

  const PAYMENT_OPTIONS = [
    { key: 'Efectivo', label: 'Efectivo', icon: <FaMoneyBillWave />, active: 'bg-green-600 text-white border-green-600' },
    { key: 'Yappy', label: 'Yappy', icon: <FaMobileAlt />, active: 'bg-blue-600 text-white border-blue-600' },
    { key: 'Tarjeta', label: 'Tarjeta', icon: <FaCreditCard />, active: 'bg-purple-600 text-white border-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* BARRA SUPERIOR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 md:mr-96">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-black text-gray-800 leading-tight">Ventas</h1>
            <p className="text-xs text-orange-600 font-semibold truncate">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleOpenReceipt} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Envases recibidos">
              <FaBoxOpen /> <span className="hidden sm:inline">Recibí envases</span>
            </button>
            <button onClick={handleOpenClosing} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Cierre de caja">
              <FaCashRegister /> <span className="hidden sm:inline">Cierre</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg" title="Salir">
              <FaSignOutAlt /> <span className="hidden sm:inline">Salir</span>
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
            {CATEGORIES.map(c => (
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
      <main className="p-4 pb-32 md:pb-6 md:mr-96">
        {cevichesData.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Cargando menú...</p>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No hay productos que coincidan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {visibleProducts.map((ceviche) => {
              const sizes = Object.keys(ceviche.prices);
              const inCart = order.filter(i => i.cevicheId === ceviche.id).reduce((s, i) => s + i.quantity, 0);
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
                            onClick={() => handleAddToOrder(ceviche.id, size, 1)}
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
        ${cartOpen ? 'max-h-[85vh]' : 'max-h-none'} md:max-h-none`}>

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

        <div className={`${cartOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-h-0`}>
          {/* Lista de Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 min-h-[80px]">
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
                      <button onClick={() => item.quantity === 1 ? handleRemoveFromOrder(item.id) : handleChangeQuantity(item.id, -1)} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600" title={item.quantity === 1 ? 'Quitar' : 'Menos'}>
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
                  onClick={() => handlePaymentMethod(p.key)}
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
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-24 p-2 border border-gray-300 rounded-lg text-sm focus:border-orange-500 outline-none"
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

            <button onClick={handleSendOrder} disabled={order.length === 0 || loading} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition ${order.length === 0 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-[0.99]'}`}>
              {loading ? 'Enviando...' : <><FaWhatsapp size={20}/> Confirmar Pedido · ${grandTotal.toFixed(2)}</>}
            </button>

            {errors && <p className="text-red-500 text-xs text-center">{errors}</p>}
          </div>
        </div>
      </aside>

      {/* Modal Envases Recibidos */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><FaBoxOpen /> Envases recibidos</h3>
            <p className="text-sm text-gray-500 mb-4">Anota los envases que te llevaron durante el día. Se suman al cuadre del cierre.</p>
            <div className="space-y-3 mb-4">
              {CONTAINERS.map(c => (
                <div key={c.key} className="flex items-center gap-3">
                  <label htmlFor={`rec-${c.key}`} className="w-16 font-semibold text-gray-700">{c.label}</label>
                  <input
                    id={`rec-${c.key}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="0"
                    value={receiptForm[c.key]}
                    onChange={e => setReceiptForm(prev => ({ ...prev, [c.key]: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                  />
                  <span className="text-xs text-gray-400 w-20 text-right">Hoy: {receiptsToday[c.key] || 0}</span>
                </div>
              ))}
            </div>
            {receiptError && <p className="text-red-500 text-sm text-center mb-3">{receiptError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowReceiptModal(false)} className="py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button onClick={handleSaveReceipt} className="py-2 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aviso Cierre de Caja (una sola vez) */}
      {showClosingConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-red-600 mb-2">⚠️ Cierre de Caja</h3>
            <p className="text-sm text-gray-600 mb-2">
              El cierre de caja <b>solo se puede hacer una vez al día</b>.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Al abrirlo verás los totales del día y ya no podrás seguir vendiendo hasta enviarlo, aunque recargues la página. Ten el dinero contado antes de continuar.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowClosingConfirm(false)} className="py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button onClick={handleConfirmOpenClosing} className="py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600">Abrir cierre</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aviso Pedido Repetido */}
      {duplicateWarning && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-yellow-700 mb-2">⚠️ Posible pedido repetido</h3>
            <p className="text-sm text-gray-600 mb-3">
              Ya se envió un pedido igual (${(parseFloat(duplicateWarning.total) || 0).toFixed(2)}, {duplicateWarning.paymentMethod || 'Efectivo'}) a las{' '}
              {duplicateWarning.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              ¿Es un pedido nuevo?
            </p>
            <ul className="text-xs text-gray-500 mb-4 space-y-1">
              {(duplicateWarning.items || []).map((item, i) => (
                <li key={i}>• {item.quantity}x {item.cevicheName} ({item.size})</li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDuplicateWarning(null)} className="py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button onClick={() => submitOrder(true)} className="py-2 rounded-lg font-bold text-white bg-yellow-500 hover:bg-yellow-600">Enviar igual</button>
            </div>
          </div>
        </div>
      )}

      {successMessage && <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[25rem] bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-[120] font-semibold">{successMessage}</div>}
    </div>
  );
};

export default CevicheVenta;