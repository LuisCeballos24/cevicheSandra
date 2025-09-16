import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import Slider from 'react-slick';
import InventoryTextForm from './InventoryTextForm';

const CevicheVenta = () => {
  const [cevichesData, setCevichesData] = useState([]);
  // El estado 'order' ahora contendrá el carrito de compras.
  const [order, setOrder] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  const [isDelivery, setIsDelivery] = useState(false);
  const [isYappy, setIsYappy] = useState(false);
  const [canSendOrder, setCanSendOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const initialCevicheLevels = {
    galonLleno: false,
    galonMedio: false,
    galonMedioLleno: false,
    galonUnCuarto: false,
    noHay: false,
  };
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
  const [dailyTotals, setDailyTotals] = useState({ efectivo: 0, yappy: 0 });
  const [closingRegisterReport, setClosingRegisterReport] = useState({
    dinero: '',
  });
  const [closingModalError, setClosingModalError] = useState(null);

  const cevicheKeys = [
    'coctelCorvina',
    'cevicheTradicionalCorvina',
    'cevicheCamaron',
    'cevicheMixto',
    'cevicheConchaNegra',
    'coctelCorvina',
    'cevichePulpo',
    'cevicheCombinacion'
  ];

  const initialInventoryDailyReport = {
    nachosGrande: '',
    nachosPequeno: '',
    vasos7oz: '',
    cucharas: false,
    bolsitas5x10: false,
    sodas: false,
    platanitos: false,
    envases16oz: '',
    envases24oz: '',
    uvas: false,
    kiwi: false,
    coco: false,
    pina: false,
    nachosSinPreparar: false,
  };

  cevicheKeys.forEach(key => {
    initialInventoryDailyReport[key] = { ...initialCevicheLevels };
  });

  const [inventoryDailyReport, setInventoryDailyReport] = useState(initialInventoryDailyReport);
  const [inventoryReportSent, setInventoryReportSent] = useState(false);
  const [inventoryModalError, setInventoryModalError] = useState(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  useEffect(() => {
    const fetchCeviches = async () => {
      try {
        const response = await fetch('/cevichesData.json');
        const data = await response.json();
        setCevichesData(data);
        setSelectedSizes(data.reduce((acc, ceviche) => ({ ...acc, [ceviche.id]: '' }), {}));
        setQuantities(data.reduce((acc, ceviche) => ({ ...acc, [ceviche.id]: 1 }), {}));
      } catch (error) {
        console.error('Error fetching ceviches:', error);
      }
    };
    fetchCeviches();
  }, []);

  useEffect(() => {
    const hasValidSelection = order.length > 0;
    setCanSendOrder(hasValidSelection);
  }, [order]);

  useEffect(() => {
    const fetchDailySales = async () => {
      if (showCloseRegisterModal && user?.name) {
        const today = new Date();
        const startOfDay = Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
        const endOfDay = Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));
        try {
          const q = query(
            collection(db, "orders"),
            where("timestamp", ">=", startOfDay),
            where("timestamp", "<=", endOfDay)
          );
          const querySnapshot = await getDocs(q);
          let totalEfectivo = 0;
          let totalYappy = 0;
          querySnapshot.forEach((doc) => {
            const order = doc.data();
            if (order.user !== user.name) return;
            const orderTotal = parseFloat(order.total) || 0;
            if (order.paymentMethod === "Yappy") {
              totalYappy += orderTotal;
            } else {
              totalEfectivo += orderTotal;
            }
          });
          setDailyTotals({ efectivo: totalEfectivo, yappy: totalYappy });
          setClosingRegisterReport((prev) => ({
            ...prev,
            dinero: totalEfectivo.toFixed(2),
          }));
        } catch (error) {
          console.error("Error fetching daily sales:", error);
        }
      }
    };
    fetchDailySales();
  }, [showCloseRegisterModal, user?.name]);


  const handleOpenCloseRegisterModal = () => {
    setClosingModalError(null);
    setShowCloseRegisterModal(true);
  };

  const validUsers = {
    cevicheSandra: 'Ceviche.sandra@24',
    cevicheAltos: 'Altos.ceviche@24',
    cevichePraderas: 'Praderas.ceviche@24',
  };

  const handleLogin = () => {
    const { name, password } = loginForm;
    if (validUsers[name] && validUsers[name] === password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name);
      setUser({ name });
      setIsLoggedIn(true);
      setErrors(null);
    } else {
      setErrors('Credenciales incorrectas.');
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('isLoggedIn');
    const storedUserName = localStorage.getItem('userName');
    const lastInventoryDate = localStorage.getItem('lastInventoryDate');
    const today = new Date().toDateString();

    if (session === 'true' && storedUserName) {
      setUser({ name: storedUserName });
      setIsLoggedIn(true);
      if (lastInventoryDate !== today) {
        setShowInventoryModal(true);
        setInventoryReportSent(false);
      } else {
        setInventoryReportSent(true);
        setShowInventoryModal(false);
      }
    } else {
      setShowInventoryModal(false);
      setInventoryReportSent(false);
    }
  }, [isLoggedIn]);

  const handleAddToOrder = (cevicheId, size, quantity) => {
    if (!size || quantity <= 0) {
      setErrors('Selecciona un tamaño y cantidad válidos.');
      return;
    }
    const ceviche = cevichesData.find(c => c.id === cevicheId);
    const price = ceviche.prices[size];
    const newOrderItem = {
      id: `${cevicheId}-${size}-${Date.now()}`, // ID único para cada item del pedido
      cevicheId,
      size,
      quantity: parseInt(quantity, 10),
      price,
      image: ceviche.image,
      cevicheName: ceviche.name,
    };
    setOrder(prev => [...prev, newOrderItem]);
    // Limpiar los estados para que el usuario pueda agregar otro item.
    setSelectedSizes(prev => ({ ...prev, [cevicheId]: '' }));
    setQuantities(prev => ({ ...prev, [cevicheId]: 1 }));
    setErrors(null);
  };

  const handleRemoveFromOrder = (itemId) => {
    setOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSendInventoryReport = async () => {
    setInventoryModalError(null);
    const numberFields = ['nachosGrande', 'nachosPequeno', 'vasos7oz', 'envases16oz', 'envases24oz'];
    const missingNumberFields = numberFields.some(key => {
      const value = inventoryDailyReport[key];
      return value === '' || isNaN(parseInt(value)) || parseInt(value) < 0;
    });
    if (missingNumberFields) {
      setInventoryModalError('Por favor, ingresa una cantidad válida (número) para todos los campos de cantidad.');
      return;
    }
    const missingCevicheSelections = cevicheKeys.some(key => {
      const cevicheState = inventoryDailyReport[key];
      return !cevicheState.galonLleno && !cevicheState.galonMedioLleno && !cevicheState.galonMedio && !cevicheState.galonUnCuarto && !cevicheState.noHay;
    });
    if (missingCevicheSelections) {
      setInventoryModalError('Por favor, selecciona el nivel de inventario para cada tipo de ceviche.');
      return;
    }
    const userName = user?.name || 'Desconocido';
    const reportDate = new Date().toDateString();
    let whatsappInventoryMessage = `*¡Reporte de Inventario Diario!*\n`;
    whatsappInventoryMessage += `*Usuario:* ${userName}\n`;
    whatsappInventoryMessage += `*Fecha:* ${new Date().toLocaleDateString('es-PA', { timeZone: 'America/Panama' })}\n\n`;
    const displayNames = {
      nachosGrande: 'Nachos Grandes', nachosPequeno: 'Nachos Pequeños', vasos7oz: 'Vasos 7oz', cucharas: 'Cucharas',
      sodas: "Sodas", platanitos: "platanitos", bolsitas5x10: 'Bolsitas 5x10', envases16oz: 'Envases 16oz', envases24oz: 'Envases 24oz',
      uvas: 'Uvas', kiwi: 'Kiwi', coco: 'Coco', pina: 'Piña', nachosSinPreparar: 'Nachos sin preparar',
      cevicheTradicionalCorvina: 'Ceviche Tradicional Corvina', cevicheCamaron: 'Ceviche Camarón', cevicheMixto: 'Ceviche Mixto',
      cevicheConchaNegra: 'Ceviche Concha Negra', coctelMixto: 'Cóctel Mixto', coctelCamaron: 'Cóctel Camarón', coctelCorvina: 'Cóctel Corvina',
      coctelTropical: 'Cóctel Tropical', cevichePulpo: 'Ceviche Pulpo', cevicheCombinacion: 'Ceviche Combinación', coctelPersonalizado: 'Cóctel Personalizado',
      coctelHawaiCorvina: 'Cóctel Hawai Corvina', coctelHawaiCamaronPulpo: 'Cóctel Hawai Camarón/Pulpo',
    };
    for (const itemKey in inventoryDailyReport) {
      const value = inventoryDailyReport[itemKey];
      const displayName = displayNames[itemKey] || itemKey;
      if (typeof value === 'boolean') {
        whatsappInventoryMessage += `*${displayName}:* ${value ? 'No hay' : 'Si hay'}\n`;
      } else if (typeof value === 'object' && value !== null) {
        let levelText = 'N/A';
        if (value.galonLleno) {
          levelText = 'Galón Lleno';
        } else if (value.galonMedioLleno) {
          levelText = 'Casi Galon Lleno';
        } else if (value.galonMedio) {
          levelText = 'Medio Galón';
        } else if (value.galonUnCuarto) {
          levelText = 'Un Cuarto de Galón';
        } else if (value.noHay) {
          levelText = 'No hay';
        }
        whatsappInventoryMessage += `*${displayName}:* ${levelText}\n`;
      } else {
        whatsappInventoryMessage += `*${displayName}:* ${value}\n`;
      }
    }
    const whatsappLink = `https://wa.me/50767961550?text=${encodeURIComponent(whatsappInventoryMessage)}`;
    try {
      await addDoc(collection(db, 'daily_inventory_reports'), {
        user: userName,
        date: reportDate,
        inventory: inventoryDailyReport,
        timestamp: new Date()
      });
      window.open(whatsappLink, '_blank');
      localStorage.setItem('lastInventoryDate', new Date().toDateString());
      setInventoryReportSent(true);
      setShowInventoryModal(false);
      setErrors(null);
      setInventoryModalError(null);
      setInventoryDailyReport(initialInventoryDailyReport);
    } catch (e) {
      console.error("Error al enviar el reporte de inventario:", e);
      setInventoryModalError(`Error al enviar el reporte: ${e.message}`);
    }
  };
  const handleSendClosingReport = async () => {
    setClosingModalError(null);
    const dineroEnCaja = parseFloat(closingRegisterReport.dinero);
    if (isNaN(dineroEnCaja) || dineroEnCaja < 0) {
      setClosingModalError('Por favor, ingresa una cantidad válida de dinero en efectivo.');
      return;
    }
    const userName = user?.name || 'Desconocido';
    let whatsappClosingMessage = `*¡Reporte de Cierre de Caja!* \n`;
    whatsappClosingMessage += `*Usuario:* ${userName}\n`;
    whatsappClosingMessage += `*Fecha:* ${new Date().toLocaleDateString('es-PA', { timeZone: 'America/Panama' })}\n\n`;
    whatsappClosingMessage += `*Total Ventas Efectivo (Sistema):* $${dailyTotals.efectivo.toFixed(2)}\n`;
    whatsappClosingMessage += `*Dinero en Caja (Reportado):* $${dineroEnCaja.toFixed(2)}\n`;
    const diferencia = dineroEnCaja - dailyTotals.efectivo;
    whatsappClosingMessage += `*Diferencia Efectivo:* $${diferencia.toFixed(2)}\n`;
    whatsappClosingMessage += `\n*Inventario Final:*\n`;
    const displayNames = {
      nachosGrande: 'Nachos Grandes', nachosPequeno: 'Nachos Pequeños', vasos7oz: 'Vasos 7oz', cucharas: 'Cucharas',
      sodas: "Sodas", platanitos: "Platanitos", bolsitas5x10: 'Bolsitas 5x10', envases16oz: 'Envases 16oz', envases24oz: 'Envases 24oz',
      uvas: 'Uvas', kiwi: 'Kiwi', coco: 'Coco', pina: 'Piña', nachosSinPreparar: 'Nachos sin preparar',
      cevicheTradicionalCorvina: 'Ceviche Tradicional Corvina', cevicheCamaron: 'Ceviche Camarón', cevicheMixto: 'Ceviche Mixto',
      cevicheConchaNegra: 'Ceviche Concha Negra', coctelMixto: 'Cóctel Mixto', coctelCamaron: 'Cóctel Camarón', coctelCorvina: 'Cóctel Corvina',
      coctelTropical: 'Cóctel Tropical', cevichePulpo: 'Ceviche Pulpo', cevicheCombinacion: 'Ceviche Combinación', coctelPersonalizado: 'Cóctel PERSONALIZADO',
      coctelHawaiCorvina: 'Cóctel Hawai Corvina', coctelHawaiCamaronPulpo: 'Cóctel Hawai Camarón/Pulpo',
    };
    const cevicheKeys = [
      'cevicheTradicionalCorvina', 'cevicheCamaron', 'cevicheMixto', 'cevicheConchaNegra',
      'coctelMixto', 'coctelCamaron', 'coctelCorvina', 'coctelTropical', 'cevichePulpo',
      'cevicheCombinacion', 'coctelPersonalizado', 'coctelHawaiCorvina', 'coctelHawaiCamaronPulpo',
    ];
    for (const itemKey in inventoryDailyReport) {
      const value = inventoryDailyReport[itemKey];
      const displayName = displayNames[itemKey] || itemKey;
      if (typeof value === 'boolean') {
        whatsappClosingMessage += `*${displayName}:* ${value ? 'No hay' : 'Sí hay'}\n`;
      } else if (typeof value === 'object' && value !== null && cevicheKeys.includes(itemKey)) {
        let levelText = 'N/A';
        if (value.galonLleno) { levelText = 'Galón Lleno'; }
        else if (value.casiGalonLleno) { levelText = 'Casi Galón Lleno'; }
        else if (value.galonMedio) { levelText = 'Medio Galón'; }
        else if (value.galonUnCuarto) { levelText = 'Un Cuarto de Galón'; }
        else if (value.noHay) { levelText = 'No hay'; }
        whatsappClosingMessage += `*${displayName}:* ${levelText}\n`;
      } else if (!cevicheKeys.includes(itemKey)) {
        whatsappClosingMessage += `*${displayName}:* ${value}\n`;
      }
    }
    const whatsappLink = `https://wa.me/50767961550?text=${encodeURIComponent(whatsappClosingMessage)}`;
    try {
      await addDoc(collection(db, 'daily_closing_reports'), {
        user: userName,
        date: new Date().toDateString(),
        cashReported: dineroEnCaja,
        systemCashSales: dailyTotals.efectivo,
        systemYappySales: dailyTotals.yappy,
        cashDifference: diferencia,
        finalInventory: inventoryDailyReport,
        timestamp: new Date(),
      });
      window.open(whatsappLink, '_blank');
      setShowCloseRegisterModal(false);
      setClosingModalError(null);
    } catch (e) {
      console.error("Error al enviar el reporte de cierre de caja:", e);
      setClosingModalError(`Error al enviar el reporte de cierre: ${e.message}`);
    }
  };
  useEffect(() => {
    const checkInventoryReport = async () => {
      const session = localStorage.getItem('isLoggedIn');
      const storedUserName = localStorage.getItem('userName');
      const today = new Date();
      const todayDateString = today.toDateString();
      if (session === 'true' && storedUserName) {
        if (!user || user.name !== storedUserName) {
          setUser({ name: storedUserName });
        }
        setIsLoggedIn(true);
        try {
          const inventoryQuery = query(
            collection(db, 'daily_inventory_reports'),
            where('user', '==', storedUserName),
            where('date', '==', todayDateString)
          );
          const querySnapshot = await getDocs(inventoryQuery);
          if (querySnapshot.empty) {
            setInventoryReportSent(false);
            setShowInventoryModal(true);
          } else {
            querySnapshot.forEach(doc => {});
            setInventoryReportSent(true);
            setShowInventoryModal(false);
          }
        } catch (error) {
          console.error("Error al verificar el reporte de inventario diario en Firestore:", error);
          setInventoryReportSent(false);
          setShowInventoryModal(true);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setInventoryReportSent(false);
        setShowInventoryModal(false);
      }
    };
    checkInventoryReport();
  }, [isLoggedIn, user?.name]);

  const handleSendOrder = async () => {
    if (order.length === 0) {
      setErrors('El carrito está vacío. Por favor, agrega al menos un ceviche.');
      return;
    }
    setIsLoading(true);
    const deliveryText = isDelivery ? 'Sí' : 'No';
    const yappyText = isYappy ? 'Sí' : 'No';
    const userName = user?.name || 'Desconocido';
    const paymentMethod = isYappy ? 'Yappy' : 'Efectivo';
    const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderMessage = order.map(item => ` ${item.quantity}x ${item.size} ${item.cevicheName} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const whatsappMessage = `*¡Pedido de Ceviche!*\n*Usuario:* ${userName}\n\n*Pedido:*\n${orderMessage}\n\n*Total del pedido:* $${total.toFixed(2)}\n\n*Tipo de entrega:* ${deliveryText}\n*¿Pago por Yappy?:* ${yappyText}`;
    const whatsappLink = `https://wa.me/50767961550?text=${encodeURIComponent(whatsappMessage)}`;
    try {
      await addDoc(collection(db, 'orders'), {
        user: user?.name || 'Desconocido',
        items: order,
        yappy: isYappy,
        total: total,
        timestamp: new Date(),
        paymentMethod: paymentMethod
      });
      window.open(whatsappLink, '_blank');
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessPopup(true);
      }, 2000);
      setOrder([]);
      setSelectedSizes(cevichesData.reduce((acc, c) => ({ ...acc, [c.id]: '' }), {}));
      setQuantities(cevichesData.reduce((acc, c) => ({ ...acc, [c.id]: 1 }), {}));
      setIsDelivery(false);
      setIsYappy(false);
      setErrors(null);
    } catch (e) {
      setErrors(`Error al enviar el pedido: ${e.message}`);
      setIsLoading(false);
    }
  };
  
  const handleSizeChange = (id, size) => {
    setSelectedSizes(prev => ({ ...prev, [id]: size }));
  };
  const handleQuantityChange = (id, quantity) => {
    setQuantities(prev => ({ ...prev, [id]: quantity }));
  };
  if (isLoggedIn && showInventoryModal && !inventoryReportSent) {
    return (
      <InventoryTextForm
        inventoryDailyReport={inventoryDailyReport}
        setInventoryDailyReport={setInventoryDailyReport}
        onSubmit={handleSendInventoryReport}
        error={inventoryModalError}
      />
    );
  }
  if (showCloseRegisterModal) {
    return (
      <InventoryTextForm
        inventoryDailyReport={inventoryDailyReport}
        setInventoryDailyReport={setInventoryDailyReport}
        onSubmit={handleSendClosingReport}
        error={closingModalError}
        isClosingReport={true}
        dailyTotals={dailyTotals}
        closingRegisterReport={closingRegisterReport}
        setClosingRegisterReport={setClosingRegisterReport}
      />
    );
  }
  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-orange-100">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center text-orange-600">Iniciar Sesión</h2>
          <input
            type="text"
            placeholder="Usuario"
            className="w-full mb-2 p-2 border rounded-lg"
            value={loginForm.name}
            onChange={e => setLoginForm({ ...loginForm, name: e.target.value })}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full mb-4 p-2 border rounded-lg"
            value={loginForm.password}
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          {errors && <p className="text-red-500 text-sm text-center mb-2">{errors}</p>}
          <button
            onClick={handleLogin}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl w-full hover:bg-orange-600"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4 text-right text-gray-600">
        Usuario: <span className="text-orange-600">{user?.name}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cevichesData.map((ceviche) => (
          <div key={ceviche.id} className="bg-red-200 bg-opacity-50 p-6 rounded-lg flex flex-col md:flex-row items-start">
            <div className="w-full mb-4 sm:mb-0 sm:w-1/2 sm:mr-4">
              {typeof ceviche.image === 'string' ? (
                <img
                  src={ceviche.image}
                  alt={`${ceviche.name} image`}
                  className="rounded-lg object-cover w-full h-auto"
                />
              ) : (
                <Slider {...settings}>
                  {Object.values(ceviche.image).map((imgSrc, index) => (
                    <div key={index} className="w-full">
                      <img
                        src={imgSrc}
                        alt={`${ceviche.name} image ${index + 1}`}
                        className="rounded-lg object-cover w-full h-auto"
                      />
                    </div>
                  ))}
                </Slider>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">{ceviche.name}</h2>
                <label htmlFor={`size-${ceviche.id}`} className="block text-lg font-medium mb-1">
                  Tamaño:
                </label>
                <select
                  id={`size-${ceviche.id}`}
                  value={selectedSizes[ceviche.id] || ''}
                  onChange={(e) => handleSizeChange(ceviche.id, e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Seleccione tamaño</option>
                  {Object.keys(ceviche.prices).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor={`quantity-${ceviche.id}`} className="block text-lg font-medium mb-1">
                  Cantidad:
                </label>
                <input
                  id={`quantity-${ceviche.id}`}
                  type="number"
                  value={quantities[ceviche.id] || ''}
                  onChange={(e) => handleQuantityChange(ceviche.id, e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <button
                onClick={() => handleAddToOrder(ceviche.id, selectedSizes[ceviche.id], quantities[ceviche.id])}
                className="bg-green-500 text-white px-4 py-2 rounded-xl mt-4 hover:bg-green-600"
              >
                Agregar al Pedido
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-xl border z-50 space-y-2 w-64 sm:w-72">
        <h3 className="text-lg font-bold">Resumen del Pedido</h3>
        {order.length > 0 ? (
          <ul>
            {order.map((item) => (
              <li key={item.id} className="text-sm my-1 flex justify-between items-center">
                <span>{item.quantity}x {item.cevicheName} ({item.size}) - ${item.price * item.quantity}</span>
                <button
                  onClick={() => handleRemoveFromOrder(item.id)}
                  className="text-red-500 text-xs ml-2"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">El pedido está vacío.</p>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Total:</span>
            <span className="font-bold text-lg">${order.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
          {errors && <p className="text-red-500 text-sm mb-2">{errors}</p>}
          <button
            onClick={handleSendOrder}
            disabled={order.length === 0}
            className={`w-full px-4 py-2 rounded-xl text-white ${order.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            Enviar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CevicheVenta;