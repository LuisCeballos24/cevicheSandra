import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './FirebaseConfig'; // Asegúrate de importar correctamente tu configuración de Firebase
import OrderSender from './OrderSender'; // Asegúrate de importar OrderSender correctamente

const CevicheOrder = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [errors, setErrors] = useState(null);
  const [cevichesData, setCevichesData] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [requireDelivery, setRequireDelivery] = useState(false);
  const [user, setUser] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const fetchCevichesData = async () => {
      try {
        const response = await fetch('/cevichesData.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCevichesData(data);
        setSelectedSizes(data.reduce((acc, ceviche) => {
          acc[ceviche.id] = ''; // Inicializar con cadena vacía para permitir deselección
          return acc;
        }, {}));
        setQuantities(data.reduce((acc, ceviche) => {
          acc[ceviche.id] = 1; // Default quantity to 1
          return acc;
        }, {}));
      } catch (error) {
        console.error('Error fetching ceviches data:', error);
      }
    };

    fetchCevichesData();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleSizeChange = (id, size) => {
    setSelectedSizes((prevSelectedSizes) => ({
      ...prevSelectedSizes,
      [id]: size,
    }));
  };

  const handleQuantityChange = (id, quantity) => {
    const validQuantity = Math.max(1, Number(quantity));
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: validQuantity,
    }));
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const validateOrder = () => {
    // Validar si al menos un ceviche ha sido seleccionado
    const selectedCeviches = Object.keys(selectedSizes).filter(id => selectedSizes[id] && quantities[id] > 0);
    if (selectedCeviches.length === 0) {
      return 'Debes seleccionar al menos un ceviche para continuar con el pedido.';
    }
    return null;
  };

  const handleSendOrder = async (loggedInUser) => {
    const validationError = validateOrder();
    if (validationError) {
      setErrors(validationError);
      return;
    }

    try {
      // Filtrar ceviches seleccionados
      const orderData = cevichesData
        .map(ceviche => ({
          name: ceviche.name,
          size: selectedSizes[ceviche.id],
          quantity: quantities[ceviche.id],
        }))
        .filter(item => item.size && item.quantity > 0); // Solo incluir ceviches con tamaño y cantidad seleccionados

      const customerDetails = {
        name: loggedInUser.displayName,
        email: loggedInUser.email
      };

      const customerLocation = requireDelivery
        ? selectedLocation
        : 'No Delivery';

      await OrderSender(orderData, customerDetails, customerLocation, loggedInUser.email);
      setShowSuccessPopup(true); // Mostrar ventana emergente de éxito
    } catch (error) {
      setErrors(`Error sending order: ${error.message}`);
    }
  };

  const handleContinueOrder = () => {
    if (user) {
      handleSendOrder(user);
    } else {
      handleLogin();
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          console.log('Ubicación actual detectada:', { lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error obteniendo ubicación actual:', error);
          alert('No se pudo obtener la ubicación actual. Por favor, asegúrate de que los permisos están habilitados.');
        },
        {
          enableHighAccuracy: true, // Intenta obtener la ubicación con la mejor precisión
          timeout: 5000, // Tiempo máximo en milisegundos para obtener la ubicación
          maximumAge: 0 // No utilizar una ubicación previamente almacenada
        }
      );
    } else {
      console.error('Geolocalización no soportada por este navegador.');
      alert('Geolocalización no soportada por este navegador.');
    }
  };

  return (
    <div className="p-4">
      {/* Ventana emergente de éxito */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">¡Correo Enviado!</h2>
            <p className="text-xl mb-4">¡Gracias por su compra, {user?.displayName}!</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between mb-6">
        <h1 className="text-3xl font-bold">Compra Ceviche!</h1>
      </div>
      
      <p className="mb-6 text-xl">Elige uno de nuestros ceviches</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cevichesData.map((ceviche) => (
          <div key={ceviche.id} className="bg-red-200 bg-opacity-50 p-6 rounded-lg flex flex-col md:flex-row items-center">
            <img
              src={ceviche.image}
              alt={`${ceviche.name} image`}
              className="rounded-lg mb-4 md:mb-0 md:mr-6"
              width="200"
              height="200"
            />
            <div>
              <h3 className="text-2xl font-bold">{ceviche.name}</h3>
              <p className="text-xl mt-2">Elige un tamaño:</p>
              <select
                value={selectedSizes[ceviche.id] || ''}
                onChange={(e) => handleSizeChange(ceviche.id, e.target.value)}
                className="mt-2 p-2 rounded border border-gray-300"
              >
                <option value="">Selecciona un tamaño</option> {/* Opción vacía */}
                {Object.keys(ceviche.prices).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <p className="mt-4 text-xl">Cantidad:</p>
              <input
                type="number"
                min="1"
                value={quantities[ceviche.id]}
                onChange={(e) => handleQuantityChange(ceviche.id, e.target.value)}
                className="mt-2 p-2 rounded border border-gray-300"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-center mt-6">
        <input
          type="checkbox"
          checked={requireDelivery}
          onChange={(e) => setRequireDelivery(e.target.checked)}
          className="mr-2"
        />
        <label>¿Requieres entrega?</label>
        {requireDelivery && (
        <div className="mt-4">
          <button
            onClick={handleUseCurrentLocation}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4"
          >
            Usar Ubicación Actual
          </button>
          <div className="mt-4">
            <p className="text-xl font-bold">Selecciona tu ubicación:</p>
            <MapComponent
              selectedLocation={selectedLocation}
              handleMapClick={(location) => setSelectedLocation(location)}
            />
          </div>
        </div>
      )}
      </div>
      <div className="mt-6">
        {errors && <p className="text-red-500 mb-4">{errors}</p>}
        <button
          onClick={handleContinueOrder}
          className="bg-green-500 text-white py-2 px-4 rounded-lg"
        >
          {user ? 'Finalizar Pedido' : 'Iniciar Sesión'}
        </button>
      </div>
    </div>
  );
};

export default CevicheOrder;
