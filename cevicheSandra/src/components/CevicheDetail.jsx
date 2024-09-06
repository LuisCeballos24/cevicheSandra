import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Slider from 'react-slick'; // Importa el componente Slider de react-slick
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css'; 

const CevicheDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ceviche } = location.state || {};
  
  const sliderRef = useRef(null); // Referencia al componente Slider

  const [selectedSize, setSelectedSize] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  const [selectedImageKey, setSelectedImageKey] = useState(null);

  useEffect(() => {
    if (ceviche && selectedImageKey) {
      const imageUrl = typeof ceviche.image === 'object' ? ceviche.image[selectedImageKey] : ceviche.image;
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => setLoadingImage(false);
      img.onerror = () => setLoadingImage(false);
    }
  }, [ceviche, selectedImageKey]);

  if (!ceviche) {
    return <p className="text-center text-lg">No se encontró información del ceviche.</p>;
  }

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

  const sizeImages = {
    '7oz': '/VasoTrasparente7oz.png',
    '16oz': '/VasoIcopor16oz.png',
    '24oz': '/VasoIcopor24oz.png',
    'medio galon': '/medioGalon.png',
    'galon': '/Galon.png'
  };

  const closeModal = () => setIsModalOpen(false);

  const handleImageChange = (imageKey) => {
    setSelectedImageKey(imageKey);
    if (sliderRef.current) {
      const index = Object.keys(ceviche.image).indexOf(imageKey);
      sliderRef.current.slickGoTo(index); // Cambia al índice de la imagen seleccionada
    }
  };

  // Mostrar automáticamente la primera imagen si hay varias imágenes
  const defaultImage = typeof ceviche.image === 'object' ? Object.keys(ceviche.image)[0] : 'singleImage';

  // Configuración del carrusel
  const carouselSettings = {
    dots: false, // Desactiva los puntos de navegación
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Activa la reproducción automática
    autoplaySpeed: 3000, // Velocidad de transición en milisegundos
    arrows: true, // Asegúrate de que las flechas de navegación estén habilitadas
    beforeChange: (current, next) => {
      setSelectedImageKey(Object.keys(ceviche.image)[next]);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-800 text-white px-4 py-2 rounded-md mb-4"
      >
        Volver
      </button>
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 mb-4 md:mb-0">
          <div className="flex flex-wrap mb-4">
            {typeof ceviche.image === 'object' ? (
              Object.keys(ceviche.image).map((imageKey) => (
                <button
                  key={imageKey}
                  onClick={() => handleImageChange(imageKey)}
                  className={`mr-2 mb-2 p-1 rounded-md border ${selectedImageKey === imageKey ? 'border-blue-500' : 'border-gray-300'}`}
                >
                  <img
                    src={ceviche.image[imageKey]}
                    alt={`Vista ${imageKey}`}
                    className="w-24 h-24 object-contain rounded" // Reducido tamaño para miniaturas
                  />
                </button>
              ))
            ) : (
              <button
                onClick={() => handleImageChange('singleImage')}
                className={`mr-2 mb-2 p-1 rounded-md border ${selectedImageKey === 'singleImage' ? 'border-blue-500' : 'border-gray-300'}`}
              >
                <img
                  src={ceviche.image}
                  alt={ceviche.name}
                  className="w-24 h-24 object-contain rounded" // Reducido tamaño para miniaturas
                />
              </button>
            )}
          </div>
          {/* Carrusel de imágenes */}
          {typeof ceviche.image === 'object' ? (
            <Slider {...carouselSettings} className="w-full" ref={sliderRef}>
              {Object.keys(ceviche.image).map((imageKey) => (
                <div key={imageKey} className="px-2">
                  <img
                    src={ceviche.image[imageKey]}
                    alt={`Vista ${imageKey}`}
                    className="w-full h-96 object-contain rounded-lg" // Tamaño más grande para la imagen principal
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <img
              src={ceviche.image}
              alt={ceviche.name}
              className="rounded-lg shadow-lg w-full h-96 object-contain"
              onLoad={() => setLoadingImage(false)}
              onError={() => setLoadingImage(false)}
            />
          )}
          {loadingImage && <p className="text-center mt-2 text-gray-600">Cargando imagen...</p>}
        </div>
        <div className="w-full md:w-1/2 md:pl-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center md:text-left">{ceviche.name}</h1>
          <div className="bg-red-200 bg-opacity-50 p-4 rounded-lg flex flex-col mb-4">
            <p className="text-base md:text-lg font-bold text-gray-800">{ceviche.description}</p>
          </div>
          <div className="bg-red-200 bg-opacity-50 p-4 rounded-lg">
            <h2 className="text-lg md:text-xl font-bold mb-2">Contamos con los siguientes tamaños:</h2>
            <p className="text-gray-800 mb-4">Haz clic en uno de los tamaños para ver un ejemplo de cómo se presenta.</p>
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
            <h2 className="text-lg md:text-xl font-bold mb-2">Ejemplo del tamaño seleccionado:</h2>
            <img
              src={sizeImages[selectedSize]}
              alt={`Ejemplo ${selectedSize}`}
              className="w-full h-auto rounded-lg object-contain" // Ajuste de tamaño del modal
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CevicheDetail;
