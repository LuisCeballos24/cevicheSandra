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

  useEffect(() => {
    const fetchCevichesData = async () => {
      try {
        const response = await fetch('/cevichesData.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCevichesData(data);
        setSelectedSizes(data.reduce((acc, ceviche) => {
          acc[ceviche.id] = '';
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
      handleSendOrder(result.user);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const handleSendOrder = (loggedInUser) => {
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

    OrderSender(orderData, customerDetails, customerLocation, loggedInUser.email);
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <i className="fas fa-chevron-left text-3xl"></i>
          <h1 className="ml-3 text-3xl font-bold">Compra Ceviche!</h1>
        </div>
        <div className="flex items-center">
          {user ? (
            <>
              <span className="mr-3 text-xl">{user.displayName}</span>
              <img
                src={user.photoURL}
                alt="User profile picture"
                className="rounded-full"
                width="60"
                height="60"
              />
              <i className="fas fa-bars text-3xl ml-3"></i>
            </>
          ) : (
            <button onClick={handleLogin} className="bg-blue-500 text-white py-1 px-3 rounded-lg">
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">Carrito de Compra</h2>
        <h2 className="text-2xl font-bold">Detalles de la compra</h2>
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
                <option value="" disabled>Selecciona un tamaño</option>
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
      <div className="flex items-center mt-6">
        <input
          className="mr-3"
          id="delivery"
          type="checkbox"
          checked={requireDelivery}
          onChange={() => setRequireDelivery(!requireDelivery)}
        />
        <label htmlFor="delivery" className="text-xl">Requiere Delivery?</label>
      </div>
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
      {selectedLocation && (
        <div className="mt-4">
          <h3 className="text-2xl font-bold">Ubicación Seleccionada:</h3>
          <p className="text-xl">Latitud: {selectedLocation.lat}</p>
          <p className="text-xl">Longitud: {selectedLocation.lng}</p>
        </div>
      )}
      <button
        onClick={handleContinueOrder}
        className="bg-green-500 text-white py-2 px-4 rounded-lg mt-4"
      >
        Continuar con el Pedido
      </button>
      {errors && (
        <div className="mt-4 p-4 bg-red-200 rounded-lg">
          <p className="text-red-800">{errors}</p>
        </div>
      )}
    </div>
  );
};

export default CevicheOrder;
