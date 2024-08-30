import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CevicheDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ceviche } = location.state || {};

  const [selectedSize, setSelectedSize] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    // Verificar si ceviche está disponible y si la imagen se carga
    if (ceviche) {
      const img = new Image();
      img.src = ceviche.image;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(false);
    }
  }, [ceviche]);

  if (!ceviche) {
    return <p>No se encontró información del ceviche.</p>;
  }

  // Tamaños en formato de lista
  const sizeList = Object.keys(ceviche.prices).map((size) => (
    <li
      key={size}
      className="mb-2 cursor-pointer text-gray-800 hover:underline"
      onClick={() => {
        setSelectedSize(size);
        setIsModalOpen(true);
      }}
    >
      {size}
    </li>
  ));

  // Mapa de imágenes de ejemplo para cada tamaño
  const sizeImages = {
    '7oz': '/VasoTrasparente7oz.png',
    '16oz': '/VasoIcopor16oz.png',
    '24oz': '/VasoIcopor24oz.png',
    'medio galon': '/medioGalon.png',
    'galon': '/Galon.png'
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-800 text-white px-4 py-2 rounded-md mb-4"
      >
        Volver
      </button>
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2">
          <img
            src={ceviche.image}
            alt={ceviche.name}
            className="rounded-lg shadow-lg w-full h-auto"
            onLoad={() => setLoadingImage(false)}
            onError={() => setLoadingImage(true)}
          />
          {loadingImage && <p className="text-center mt-2">Cargando imagen...</p>}
        </div>
        <div className="w-full md:w-1/2 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{ceviche.name}</h1>
          <div className="bg-red-200 bg-opacity-50 p-4 md:p-6 rounded-lg flex flex-col mb-4">
            <p className="text-base md:text-lg text-gray-800 mb-4">{ceviche.description}</p>
          </div>
          <div className="bg-red-200 bg-opacity-50 p-4 md:p-6 rounded-lg">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Contamos con los siguientes tamaños:
            </h2>
            <p className="text-gray-800 mb-4">
              Haz clic en uno de los tamaños para ver un ejemplo de cómo se presenta.
            </p>
            <ul className="list-disc pl-5 mb-4 text-gray-800 font-bold">
              {sizeList}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-xs md:max-w-md mx-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full"
            >
              &times;
            </button>
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Ejemplo del tamaño seleccionado:
            </h2>
            <img
              src={sizeImages[selectedSize]}
              alt={`Ejemplo ${selectedSize}`}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CevicheDetail;
