import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './MapComponent';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './FirebaseConfig'; // Asegúrate de importar correctamente tu configuración de Firebase
import OrderSender from './OrderSender'; // Asegúrate de importar OrderSender correctamente
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CevicheOrden = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [errors, setErrors] = useState(null);
  const [cevichesData, setCevichesData] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [requireDelivery, setRequireDelivery] = useState(false);
  const [user, setUser] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  // Estado para manejar el modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalContent, setModalContent] = useState({ name: '', size: '', quantity: 1 });

  const orderSectionRef = useRef(null);

  const Modal = ({ isOpen, closeModal, content }) => {
    if (!isOpen) return null;
  }// No mostrar si el modal no está abierto

  const closeModal = () => {
    // Resetea el mensaje de error al cerrar el modal
    setErrors(null);

    // Cierra el modal de confirmación
    setIsModalOpen(false);

    // Si hay errores, no hacer el scroll
    if (errors) {
      console.log('Errors present, not scrolling');
      return;
    }

    // Si no hay errores, realizar el scroll después de cerrar el modal
    setTimeout(() => {
      if (orderSectionRef.current) {
        console.log('Scrolling to order section');
        orderSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.log('Order section ref is not available');
      }
    }, 300); // Ajusta el tiempo según sea necesario
  };

  const handleSizeChange = (cevicheId, selectedSize, quantity) => {
    if (!selectedSize || quantity <= 0) {
      setErrors('Por favor selecciona un tamaño y una cantidad válidos.');
      return;
    }
  
    // Actualiza el tamaño seleccionado
    setSelectedSizes(prevSizes => ({
      ...prevSizes,
      [cevicheId]: selectedSize
    }));
  
    // Llama a handleAddToOrder para manejar la adición al pedido
    handleAddToOrder(cevicheId, selectedSize, quantity);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,          // Activa la reproducción automática
    autoplaySpeed: 3000
  }

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

  const handleAddToOrder = (cevicheId, selectedSize, selectedQuantity) => {
    if (!selectedSize || !selectedQuantity) {
      setErrors('Por favor selecciona TAMAÑO y CANTIDAD Correctos.');
      return;
    }

    // Encuentra el ceviche agregado usando el ID
    const ceviche = cevichesData.find((ceviche) => ceviche.id === cevicheId);
    if (!ceviche) {
      setErrors('Ceviche no encontrado.');
      return;
    }

    // Obtén el precio basado en el tamaño seleccionado
    const price = ceviche.prices[selectedSize];
    if (!price) {
      setErrors('Precio para el tamaño seleccionado no encontrado.');
      return;
    }

    // Agrega el ceviche al pedido
    setOrder((prevOrder) => [
      ...prevOrder,
      { cevicheId, size: selectedSize, quantity: selectedQuantity, price, image: ceviche.image },
    ]);

    // Configura el contenido del modal
    setModalContent({
      name: ceviche.name,
      size: selectedSize,
      quantity: selectedQuantity,
      price: price * selectedQuantity, // Calcula el precio total
      image: ceviche.image,
    });

    // Abre el modal
    setIsModalOpen(true);

    // Limpia errores después de agregar
    setErrors(null);
  };
  
  const handleRemoveFromOrder = (index) => {
    // Crear una copia del array de pedidos
    const updatedOrder = [...order];
    // Eliminar el ítem en el índice dado
    updatedOrder.splice(index, 1);
    // Actualizar el estado con el nuevo array de pedidos
    setOrder(updatedOrder);
  };

  const handleQuantityChange = (id, quantity) => {
    // Si la cantidad es una cadena vacía, permite borrar el valor
    if (quantity === '') {
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [id]: '', // Permite el valor vacío
      }));
    } else {
      const parsedQuantity = parseInt(quantity, 10);
  
      // Asegúrate de que el valor sea un número entero no negativo
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [id]: 1, // Reestablece a 1 si el valor es inválido
        }));
      } else {
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [id]: parsedQuantity, // Establece la cantidad a lo que el usuario escribió
        }));
      }
    }
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
    console.log('Selected Sizes:', selectedSizes);
    console.log('Quantities:', quantities);

    const selectedCeviches = Object.keys(selectedSizes).filter(id => {
      const isSelected = selectedSizes[id];
      const quantity = quantities[id] || 0; // Asegúrate de que `quantities[id]` es 0 si no existe
      console.log(`ID: ${id}, Size Selected: ${isSelected}, Quantity: ${quantity}`);
      return isSelected && quantity > 0;
    });

    console.log('Selected Ceviches:', selectedCeviches);

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

    setLoading(true);

    try {
      // Filtrar ceviches seleccionados
      const orderData = cevichesData
        .map(ceviche => ({
          name: ceviche.name,
          size: selectedSizes[ceviche.id],
          quantity: quantities[ceviche.id] || 0, // Asegúrate de que la cantidad sea 0 si no está definida
          price: ceviche.prices[selectedSizes[ceviche.id]] || 0, // Añade el precio según el tamaño seleccionado
        }))
        .filter(item => item.size && item.quantity > 0); // Solo incluir ceviches con tamaño y cantidad seleccionados

      console.log('Order Data:', orderData);

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
    } finally {
      setLoading(false); // Asegúrate de que el loading se apague
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
      console.log('Geolocalización soportada, intentando obtener la ubicación...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({ lat: latitude, lng: longitude });
          console.log('Ubicación actual detectada:', { lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error obteniendo ubicación actual:', error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert('Permiso de geolocalización denegado. Por favor, permite el acceso a la ubicación.');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('La información de ubicación no está disponible.');
              break;
            case error.TIMEOUT:
              alert('La solicitud para obtener la ubicación ha expirado. Inténtalo de nuevo.');
              break;
            default:
              alert('Error desconocido al obtener la ubicación.');
              break;
          }
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

      {/* Mensaje de carga */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Procesando Pedido...</h2>
            <p>Por favor, espera mientras procesamos tu pedido.</p>
          </div>
        </div>
      )}

      {/* Modal de confirmación de producto agregado */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 text-center">
            {/* Imagen del ceviche */}
            {modalContent.image && (
              <img
                src={modalContent.image}
                alt={modalContent.name}
                className="w-24 h-24 object-cover rounded-lg mx-auto mb-4"
              />
            )}

            <h3 className="text-lg font-bold mb-4">Producto Agregado Correctamente</h3>
            <p className="text-gray-700 mb-2">
              {modalContent.quantity} {modalContent.name}, {modalContent.size} agregado correctamente.
            </p>
            <p className="text-gray-900 font-semibold mb-2">
              Precio: ${modalContent.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Puedes ir a la parte de abajo para ver los detalles del pedido.
            </p>
            <button
              onClick={closeModal}
              className="mt-6 bg-red-200 hover:bg-red-300 text-gray-800 font-bold py-2 px-4 rounded-lg w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {errors && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 text-center">
            <h3 className="text-lg font-bold mb-4">Verifica tu Pedido</h3>
            <p className="text-gray-700 mb-4">
              {errors}
            </p>
            <button
              onClick={closeModal}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg w-full"
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
                <h2 className="text-lg font-semibold mb-2">{ceviche.name}</h2> {/* Nombre del ceviche */}
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
                {console.log('Component rendered:', quantities[ceviche.id])}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Mostrar mensaje de error si existe */}
      {errors && <p className="text-red-500 font-semibold">{errors}</p>}

      {/* Modal para mostrar confirmación */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} content={modalContent} />

      {/* Sección de Pedido Actual */}
      <h2 className="text-xl font-bold mt-8 mb-4">Pedido Actual:</h2>
      {order.length === 0 ? (
        <p className="text-lg font-semibold">No hay items en el pedido</p>
      ) : (
        <div ref={orderSectionRef} className="space-y-4">
          <ul className="divide-y divide-gray-300">
            {order.map((item, index) => {
              const ceviche = cevichesData.find((ceviche) => ceviche.id === item.cevicheId);
              if (!ceviche) return null; // Asegúrate de que el ceviche existe

              const pricePerUnit = ceviche.prices[item.size]; // Precio por unidad
              const totalItemPrice = pricePerUnit * item.quantity; // Precio total del ítem

              return (
                <li
                  key={index}
                  className="bg-red-200 bg-opacity-50 p-4 rounded-lg flex flex-col md:flex-row items-start justify-between shadow-md"
                >
                  {/* Imagen del Ceviche */}
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <img
                      src={ceviche.image} // Imagen del ceviche
                      alt={ceviche.name}
                      className="w-24 h-24 object-cover rounded-full shadow-lg"
                    />
                  </div>
                  {/* Detalles del Pedido */}
                  <div className="flex-grow md:ml-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{ceviche.name}</h3>
                    <p className="text-sm font-medium text-gray-700">Tamaño: {item.size} - Cantidad: {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Precio: ${totalItemPrice.toFixed(2)}</p>
                  </div>
                  {/* Botón de Eliminar */}
                  <button
                    onClick={() => handleRemoveFromOrder(index)}
                    className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Eliminar
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

<div className="flex flex-col md:flex-row items-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
<div className="flex items-center">
    <input
      type="checkbox"
      checked={requireDelivery}
      onChange={(e) => setRequireDelivery(e.target.checked)}
      className="mr-2"
    />
    <label className="text-gray-700">¿Requieres entrega?</label>
  </div>

  {requireDelivery && (
    <div className="flex flex-col items-center md:items-start w-full md:w-auto mt-4">
      <button
        onClick={handleUseCurrentLocation}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full md:w-auto"
      >
        Usar Ubicación Actual
      </button>
      <div className="mt-4 w-full">
        <p className="text-xl font-bold text-center md:text-left">Selecciona tu ubicación:</p>
        <MapComponent
          selectedLocation={selectedLocation}
          handleMapClick={(location) => setSelectedLocation(location)}
        />
      </div>
    </div>
  )}
</div>
      <div className="mt-6 w-full flex flex-col items-center md:items-start">
        {errors && <p className="text-red-500 mb-4 text-center md:text-left">{errors}</p>}
        <button
          onClick={handleContinueOrder}
          className="bg-green-500 text-white py-2 px-4 rounded-lg w-full md:w-auto"
        >
          {user ? 'Finalizar Pedido' : 'Iniciar Sesión'}
        </button>
      </div>
    </div>
  );
};

export default CevicheOrden;
