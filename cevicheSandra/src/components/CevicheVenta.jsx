import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig'; // Asegúrate de tener la configuración de Firebase
import { collection, addDoc } from 'firebase/firestore'; // Necesario para guardar en Firestore
import Slider from 'react-slick'; // Asegúrate de tener configurado el Slider

const CevicheVenta = () => {
  const [cevichesData, setCevichesData] = useState([]);
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
    const hasValidSelection = cevichesData.some(c => {
      const size = selectedSizes[c.id];
      const quantity = quantities[c.id];
      return size && quantity > 0;
    });
    setCanSendOrder(hasValidSelection);
  }, [selectedSizes, quantities, cevichesData]);


  const validUsers = {
    cevicheSandra: 'Ceviche.sandra@24',
    cevicheAltos: 'Altos.ceviche@24',
    cevichePraderas: 'Praderas.ceviche@24',
  };

  const handleLogin = () => {
    const { name, password } = loginForm;
    if (validUsers[name] && validUsers[name] === password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', name); // <-- Agrega esto
      setUser({ name });
      setIsLoggedIn(true);
      setErrors(null);
    } else {
      setErrors('Credenciales incorrectas.');
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('isLoggedIn');
    const storedUserName = localStorage.getItem('userName'); // <-- Agrega esto
  
    if (session === 'true' && storedUserName) {
      setUser({ name: storedUserName }); // <-- Restaura el nombre del usuario
      setIsLoggedIn(true);
    }
  }, []);

  const handleAddToOrder = (cevicheId, size, quantity) => {
    if (!size || quantity <= 0) {
      setErrors('Selecciona un tamaño y cantidad válidos.');
      return;
    }

    const ceviche = cevichesData.find(c => c.id === cevicheId);
    const price = ceviche.prices[size];

    setOrder(prev => [...prev, { cevicheId, size, quantity, price, image: ceviche.image, cevicheName: ceviche.name }]);
    setModalContent({ name: ceviche.name, size, quantity, price: price * quantity, image: ceviche.image });
    setIsModalOpen(true);
    setErrors(null);
  };

  const handleSendOrder = async () => {
    const selectedItems = cevichesData
      .map(c => ({
        name: c.name,
        size: selectedSizes[c.id],
        quantity: quantities[c.id],
        price: c.prices[selectedSizes[c.id]] || 0,
      }))
      .filter(item => item.size && item.quantity > 0);

    if (selectedItems.length === 0) {
      setErrors('Por favor llena los campos y selecciona al menos un ceviche.');
      return;
    }

    const deliveryText = isDelivery ? 'Sí' : 'No';
    const yappyText = isYappy ? 'Sí' : 'No';
    const userName = user?.name || 'Desconocido';

    const orderMessage = selectedItems
      .map(item => `${item.quantity}x ${item.size} ${item.name} - $${item.price * item.quantity}`)
      .join('%0A');
    const whatsappMessage = `¡Pedido de Ceviche!%0AUsuario: ${userName}%0A%0A${orderMessage}%0A%0ADelivery: ${deliveryText}%0APago por Yappy: ${yappyText}`;
    const whatsappLink = `https://wa.me/50767961550?text=${whatsappMessage}`;

    try {
      await addDoc(collection(db, 'orders'), {
        user: user?.name || 'Desconocido',
        items: selectedItems,
        total: selectedItems.reduce((total, item) => total + item.price * item.quantity, 0),
        timestamp: new Date(),
      });

      window.open(whatsappLink, '_blank');
      setShowSuccessPopup(true);
      {
        showSuccessPopup && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg z-50">
            ¡Pedido enviado con éxito!
          </div>
        )
      }

      // Limpiar estado
      setOrder([]);
      setSelectedSizes(cevichesData.reduce((acc, c) => ({ ...acc, [c.id]: '' }), {}));
      setQuantities(cevichesData.reduce((acc, c) => ({ ...acc, [c.id]: 1 }), {}));
      setIsDelivery(false);
      setIsYappy(false);
      setErrors(null);
    } catch (e) {
      setErrors(`Error al enviar el pedido: ${e.message}`);
    }
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };


  const handleSizeChange = (id, size, quantity) => {
    setSelectedSizes(prev => ({ ...prev, [id]: size }));
    setQuantities(prev => ({ ...prev, [id]: quantity }));
  };

  const handleQuantityChange = (id, quantity) => {
    setQuantities(prev => ({ ...prev, [id]: quantity }));
  };

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
                  onChange={(e) => handleSizeChange(ceviche.id, e.target.value, quantities[ceviche.id] || 0)}
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
              {/* Agregar botón de "Agregar" */}
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

      {/* Modal de Confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-xl font-semibold">{modalContent.name}</h2>
            <img src={modalContent.image} alt="Ceviche" className="w-full h-auto rounded-lg mt-4" />
            <p className="mt-2">Tamaño: {modalContent.size}</p>
            <p className="mt-2">Cantidad: {modalContent.quantity}</p>
            <p className="mt-2">Total: ${modalContent.price}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-orange-600 text-white px-4 py-2 rounded-xl mt-4 w-full hover:bg-orange-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
      <div className="fixed bottom-40 sm:bottom-48 right-4 bg-white shadow-lg p-4 rounded-xl border z-50 space-y-2 w-64 sm:w-72">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isDelivery}
            onChange={() => setIsDelivery(!isDelivery)}
            className="form-checkbox text-orange-500"
          />
          <span>¿Es delivery Sandra?</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isYappy}
            onChange={() => setIsYappy(!isYappy)}
            className="form-checkbox text-orange-500"
          />
          <span>¿Pago por Yappy?</span>
        </label>
      </div>


      {/* Botón flotante para confirmar pedido */}
      {/* Confirmar Pedido */}
      <button
        onClick={handleSendOrder}
        className="fixed bottom-20 right-6 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-700 z-50"
      >
        Confirmar Pedido
      </button>
      <button
        onClick={() => {
          localStorage.removeItem('isLoggedIn');
          setIsLoggedIn(false);
        }}
        className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-600 z-50"
      >
        Cerrar sesión
      </button>
      {/* Cerrar sesión */}
      {/* Error y confirmación de pedido */}
      {errors && <p className="text-red-500 mt-4 text-center">{errors}</p>}
    </div>
  );
};

export default CevicheVenta;