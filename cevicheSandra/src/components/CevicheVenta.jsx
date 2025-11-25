import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import Slider from 'react-slick';
import InventoryTextForm from './InventoryTextForm';
import { FaTrash, FaSignOutAlt, FaCashRegister, FaWhatsapp, FaTag } from 'react-icons/fa';

const CevicheVenta = () => {
  // --- ESTADOS ---
  const [cevichesData, setCevichesData] = useState([]);
  const [order, setOrder] = useState([]); 
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  
  // Promociones
  const [promoCorvina, setPromoCorvina] = useState(false);
  const [promo16oz, setPromo16oz] = useState(false);

  // Usuario y Sesión
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', password: '' });
  
  // UI y Modales
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
  
  // Opciones de Pedido
  const [isDelivery, setIsDelivery] = useState(false);
  const [isYappy, setIsYappy] = useState(false);

  // Inventario y Cierre
  const [inventoryDailyReport, setInventoryDailyReport] = useState({});
  const [inventoryReportSent, setInventoryReportSent] = useState(false);
  const [inventoryModalError, setInventoryModalError] = useState(null);
  const [dailyTotals, setDailyTotals] = useState({ efectivo: 0, yappy: 0 });
  const [closingRegisterReport, setClosingRegisterReport] = useState({ dinero: '' });
  const [closingModalError, setClosingModalError] = useState(null);

  const settings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1 };

  const validUsers = {
    cevicheSandra: 'Ceviche.sandra@24',
    cevicheAltos: 'Altos.ceviche@24',
    cevichePraderas: 'Praderas.ceviche@24',
  };

  // --- EFECTOS ---
  useEffect(() => {
    const fetchCeviches = async () => {
      try {
        const response = await fetch('/cevichesData.json');
        const data = await response.json();
        setCevichesData(data);
        
        // Inicializamos estados de venta
        const initialSizes = {};
        const initialQts = {};
        data.forEach(c => {
            initialSizes[c.id] = '';
            initialQts[c.id] = 1;
        });
        setSelectedSizes(initialSizes);
        setQuantities(initialQts);

        // --- CONFIGURACIÓN DEL REPORTE DE INVENTARIO ---
        const initialCevicheState = { 
            galonLleno: false, galonMedio: false, galonMedioLleno: false, galonUnCuarto: false, noHay: false 
        };

        const initialReport = {
            // 1. Insumos
            nachosGrande: '', nachosPequeno: '', vasos7oz: '', cucharas: false, bolsitas5x10: false,
            sodas: '', platanitos: '', envases16oz: '', envases24oz: '', uvas: false,
            kiwi: false, coco: false, pina: false, nachosSinPreparar: false, vuelto: false,

            // 2. Ceviches y Cocteles
            cevicheTradicionalCorvina: { ...initialCevicheState },
            cevicheCamaron: { ...initialCevicheState },
            cevicheMixto: { ...initialCevicheState },
            cevicheConchaNegra: { ...initialCevicheState },
            coctelMixto: { ...initialCevicheState },
            coctelCamaron: { ...initialCevicheState },
            coctelCorvina: { ...initialCevicheState },
            coctelTropical: { ...initialCevicheState },
            cevichePulpo: { ...initialCevicheState },
            cevicheCombinacion: { ...initialCevicheState },
            coctelPersonalizado: { ...initialCevicheState },
            coctelHawaiCorvina: { ...initialCevicheState },
            coctelHawaiCamaronPulpo: { ...initialCevicheState },
        };

        setInventoryDailyReport(initialReport);

      } catch (error) {
        console.error('Error fetching ceviches:', error);
      }
    };
    fetchCeviches();
  }, []);

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
      }
    };
    checkSessionAndInventory();
  }, []);

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
            const orderData = doc.data();
            if (orderData.user !== user.name) return;
            
            const monto = parseFloat(orderData.total) || 0;
            if (orderData.paymentMethod === "Yappy") {
              totalYappy += monto;
            } else {
              totalEfectivo += monto;
            }
          });
          
          setDailyTotals({ efectivo: totalEfectivo, yappy: totalYappy });
          setClosingRegisterReport(prev => ({ ...prev, dinero: totalEfectivo.toFixed(2) }));
          
        } catch (error) {
          console.error("Error fetching sales:", error);
        }
      }
    };
    fetchDailySales();
  }, [showCloseRegisterModal, user?.name]);


  // --- HANDLERS ---

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

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUser(null);
  };

  // --- LÓGICA PRINCIPAL DE PRECIOS Y PROMOCIONES (CORREGIDO ID 8) ---
  const handleAddToOrder = (cevicheId, size, quantity) => {
    if (!size || quantity <= 0) {
      setErrors('Selecciona un tamaño y cantidad válidos.');
      return;
    }
    const ceviche = cevichesData.find(c => c.id === cevicheId);
    
    // Convertimos precio a número para evitar errores
    const originalPrice = parseFloat(ceviche.prices[size]);
    let finalPrice = originalPrice; 
    let appliedPromos = [];

    // --- LÓGICA DE PRIORIDAD DE DESCUENTOS ---

    // Detectar si es Coctel Corvina usando el ID 8
    // Usamos '==' (doble igual) para que coincida si el ID es 8 (número) o "8" (string)
    const isCoctelCorvina = (cevicheId == 8);

    // 1. PRIMERO: Verificamos Promo Corvina ($5.50)
    // Se cumple si: Checkbox activo + Es ID 8 + Es 16oz
    if (promoCorvina && isCoctelCorvina && size === '16oz') {
        finalPrice = 5.50;
        appliedPromos.push("Promo Corvina ($5.50)");
    } 
    // 2. SEGUNDO: Si NO entró en la anterior, verificamos Promo General ($1.00 OFF)
    // Se cumple si: Checkbox activo + Es 16oz (y no se aplicó la de 5.50)
    else if (promo16oz && size === '16oz') {
        finalPrice = finalPrice - 1.00;
        appliedPromos.push("-1$ 16oz");
    }

    const subtotal = finalPrice * parseInt(quantity);

    const newItem = {
      id: `${cevicheId}-${size}-${Date.now()}`,
      cevicheId,
      cevicheName: ceviche.name,
      size,
      quantity: parseInt(quantity),
      originalPrice: originalPrice, 
      price: finalPrice, // Precio ya con descuento
      subtotal: subtotal,
      promos: appliedPromos.join(', ')
    };

    setOrder(prev => [...prev, newItem]);
    
    setSelectedSizes(prev => ({ ...prev, [cevicheId]: '' }));
    setQuantities(prev => ({ ...prev, [cevicheId]: 1 }));
    setErrors(null);
  };

  const handleRemoveFromOrder = (itemId) => {
    setOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSendOrder = async () => {
    if (order.length === 0) {
      setErrors('El carrito está vacío.');
      return;
    }
    setLoading(true);

    // Sumamos los subtotales que YA tienen el precio descontado
    const total = order.reduce((sum, item) => sum + item.subtotal, 0);
    
    const deliveryText = isDelivery ? 'Sí' : 'No';
    const yappyText = isYappy ? 'Sí' : 'No';
    const paymentMethod = isYappy ? 'Yappy' : 'Efectivo';
    
    const itemsText = order.map(item => {
        const promoText = item.promos ? ` (Promos: ${item.promos})` : '';
        return `• ${item.quantity}x ${item.cevicheName} (${item.size}) - $${item.subtotal.toFixed(2)}${promoText}`;
    }).join('\n');
    
    const whatsappMsg = `*¡Nuevo Pedido!*\nUser: ${user.name}\n\n${itemsText}\n\n*Total: $${total.toFixed(2)}*\nDelivery: ${deliveryText}\nYappy: ${yappyText}`;
    const whatsappLink = `https://wa.me/50767961550?text=${encodeURIComponent(whatsappMsg)}`;

    try {
      await addDoc(collection(db, 'orders'), {
        user: user.name,
        items: order, 
        total: total, // Enviamos el total ya con descuento
        isDelivery,
        isYappy,
        paymentMethod,
        promotionsUsed: { promoCorvina, promo16oz },
        timestamp: new Date()
      });

      window.open(whatsappLink, '_blank');
      
      setOrder([]);
      setIsDelivery(false);
      setIsYappy(false);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
      
    } catch (e) {
      console.error(e);
      setErrors('Error al guardar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers de Inventario y Cierre
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
                 inventoryText += `\n- ${name}: ${level}`;
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

  const handleSendClosingReport = async () => {
     try {
         const cashReported = parseFloat(closingRegisterReport.dinero);
         if (isNaN(cashReported)) { setClosingModalError("Monto inválido"); return; }
         const diff = cashReported - dailyTotals.efectivo;

         let inventoryText = "";
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

         const msg = `*Cierre de Caja - ${user.name}*\nFecha: ${new Date().toLocaleDateString()}\n\n*DINERO:*\n- Sistema (Efectivo): $${dailyTotals.efectivo.toFixed(2)}\n- En Caja (Real): $${cashReported.toFixed(2)}\n- Diferencia: $${diff.toFixed(2)}\n\n*INVENTARIO FINAL:*${inventoryText}`;
         const link = `https://wa.me/50767961550?text=${encodeURIComponent(msg)}`;
         
         await addDoc(collection(db, 'daily_closing_reports'), { 
             user: user.name, 
             date: new Date().toDateString(), 
             cashReported, 
             systemTotals: dailyTotals, 
             finalInventory: inventoryDailyReport,
             timestamp: new Date() 
         });
         
         window.open(link, '_blank');
         setShowCloseRegisterModal(false);
         setClosingModalError(null);
     } catch (e) { setClosingModalError(e.message); }
  };


  // --- RENDERS ---

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

  if (showInventoryModal && !inventoryReportSent) {
      return <InventoryTextForm 
                inventoryDailyReport={inventoryDailyReport} 
                setInventoryDailyReport={setInventoryDailyReport} 
                onSubmit={handleSendInventoryReport} 
                error={inventoryModalError} 
             />;
  }

  if (showCloseRegisterModal) {
      return <InventoryTextForm 
                inventoryDailyReport={inventoryDailyReport} 
                setInventoryDailyReport={setInventoryDailyReport} 
                onSubmit={handleSendClosingReport} 
                error={closingModalError} 
                isClosingReport={true} 
                dailyTotals={dailyTotals} 
                closingRegisterReport={closingRegisterReport} 
                setClosingRegisterReport={setClosingRegisterReport} 
             />;
  }

  // --- RENDER PRINCIPAL ---
  const grandTotal = order.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* 1. SECCIÓN PRINCIPAL */}
      <div className="flex-1 p-4 md:p-6 pb-40 md:pb-6 md:mr-80"> 
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Menú</h1>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                Hola, {user.name}
            </span>
        </div>

        {/* PROMOCIONES */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-3">
                <FaTag /> Promociones del Día
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${promoCorvina ? 'bg-yellow-100 border-yellow-400 ring-1 ring-yellow-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={promoCorvina} onChange={() => setPromoCorvina(!promoCorvina)} className="w-5 h-5 accent-orange-500" />
                    <div><span className="font-bold text-gray-800 block text-sm">Cóctel Corvina $5.50</span><span className="text-xs text-gray-500">Normalmente $7.00 (16oz)</span></div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${promo16oz ? 'bg-yellow-100 border-yellow-400 ring-1 ring-yellow-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={promo16oz} onChange={() => setPromo16oz(!promo16oz)} className="w-5 h-5 accent-orange-500" />
                    <div><span className="font-bold text-gray-800 block text-sm">-$1.00 en Pintas (16oz)</span><span className="text-xs text-gray-500">Descuento en todos los 16oz</span></div>
                </label>
            </div>
        </div>

        {/* GRID DE PRODUCTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cevichesData.map((ceviche) => (
            <div key={ceviche.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col h-[450px]">
              <div className="h-48 w-full bg-gray-200 relative">
                {typeof ceviche.image === 'string' ? (
                  <img src={ceviche.image} alt={ceviche.name} className="w-full h-full object-cover" />
                ) : (
                  <Slider {...settings} className="h-full w-full overflow-hidden">
                    {Object.values(ceviche.image).map((img, i) => (
                      <div key={i} className="h-48 w-full outline-none">
                        <img src={img} alt="" className="w-full h-full object-cover block" />
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div><h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">{ceviche.name}</h3></div>
                
                <div className="mt-2 space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Tamaño</label>
                        <select value={selectedSizes[ceviche.id] || ''} onChange={(e) => setSelectedSizes({...selectedSizes, [ceviche.id]: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:border-orange-500 outline-none">
                            <option value="">Seleccionar...</option>
                            {Object.keys(ceviche.prices).map(size => (<option key={size} value={size}>{size} - ${ceviche.prices[size]}</option>))}
                        </select>
                    </div>
                    
                    <div className="flex gap-2 items-end">
                        <div className="w-20">
                            <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Cant.</label>
                            <select value={quantities[ceviche.id] || 1} onChange={(e) => setQuantities({...quantities, [ceviche.id]: parseInt(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-lg bg-white text-center text-sm focus:border-orange-500 outline-none cursor-pointer">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (<option key={num} value={num}>{num}</option>))}
                            </select>
                        </div>
                        <button onClick={() => handleAddToOrder(ceviche.id, selectedSizes[ceviche.id], quantities[ceviche.id])} className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white p-2 rounded-lg font-medium flex-1 h-[38px] flex items-center justify-center transition shadow-sm text-sm">Agregar</button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SIDEBAR (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 md:top-0 md:left-auto md:right-0 md:w-80 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-[-4px_0_20px_rgba(0,0,0,0.05)] z-50 flex flex-col max-h-[60vh] md:max-h-screen">
        <div className="p-4 bg-orange-600 text-white flex justify-between items-center shadow-sm">
            <h2 className="font-bold text-lg">Resumen</h2>
            <span className="text-sm bg-white/20 px-2 py-1 rounded">{order.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {order.length === 0 ? (
                <div className="text-center text-gray-400 py-10"><p>El carrito está vacío</p></div>
            ) : (
                order.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{item.cevicheName}</p>
                            <p className="text-xs text-gray-500">{item.quantity} x {item.size}</p>
                            
                            {/* VISUALIZACIÓN DEL DESCUENTO */}
                            {item.originalPrice !== item.price && (
                                <p className="text-[10px] text-gray-400 line-through">Antes: ${item.originalPrice.toFixed(2)}</p>
                            )}
                            {item.promos && <p className="text-[10px] text-green-600 font-bold mt-1">🏷️ {item.promos}</p>}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-orange-600 text-sm">${item.subtotal.toFixed(2)}</span>
                            <button onClick={() => handleRemoveFromOrder(item.id)} className="text-red-400 hover:text-red-600 text-xs mt-1"><FaTrash /></button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 bg-white border-t border-gray-200 space-y-3">
            <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center hover:bg-gray-200"><input type="checkbox" checked={isDelivery} onChange={() => setIsDelivery(!isDelivery)} className="accent-orange-500" /><span className="text-sm font-medium">Delivery</span></label>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center hover:bg-gray-200"><input type="checkbox" checked={isYappy} onChange={() => setIsYappy(!isYappy)} className="accent-blue-500" /><span className="text-sm font-medium">Yappy</span></label>
            </div>
            <div className="flex justify-between items-end mb-2"><span className="text-gray-500 font-medium">Total a Pagar:</span><span className="text-2xl font-bold text-gray-800">${grandTotal.toFixed(2)}</span></div>
            <button onClick={handleSendOrder} disabled={order.length === 0 || loading} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition ${order.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>{loading ? 'Enviando...' : <><FaWhatsapp size={20}/> Confirmar Pedido</>}</button>
            <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t">
                <button onClick={() => setShowCloseRegisterModal(true)} className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"><FaCashRegister /> Cierre Caja</button>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><FaSignOutAlt /> Salir</button>
            </div>
            {errors && <p className="text-red-500 text-xs text-center">{errors}</p>}
        </div>
      </div>
      
      {showSuccessPopup && <div className="fixed top-5 right-5 md:right-96 bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl z-[100] animate-bounce">✅ Pedido enviado con éxito</div>}
    </div>
  );
};

export default CevicheVenta;