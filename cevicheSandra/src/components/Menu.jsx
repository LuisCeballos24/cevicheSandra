import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Menu = () => {
  const [cevichesData, setCevichesData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCevichesData = async () => {
      try {
        const response = await fetch('/cevichesData.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCevichesData(data);
      } catch (error) {
        console.error('Error fetching ceviches data:', error);
      }
    };

    fetchCevichesData();
  }, []);

  const handleCevicheClick = (ceviche) => {
    navigate(`/ceviche/${ceviche.id}`, { state: { ceviche } });
  };

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">Menú de Ceviches</h1>
      </div>

      {/* Indicación destacada */}
      <div className="bg-[rgba(226,149,120,0.8)] rounded-lg shadow-lg text-center p-4 mb-6">
        <p className="text-lg md:text-xl font-semibold text-gray-800">¡Haz clic en un ceviche para saber más sobre su historia o reseña!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cevichesData.map((ceviche) => (
          <div
            key={ceviche.id}
            className="bg-[rgba(226,149,120,0.8)] rounded-lg shadow-lg p-4 flex flex-col items-center cursor-pointer hover:bg-yellow-100 transition duration-300 ease-in-out"
            onClick={() => handleCevicheClick(ceviche)}
          >
            {typeof ceviche.image === 'object' && Object.values(ceviche.image).length > 1 ? (
              // Carrusel si hay múltiples imágenes
              <Slider {...settings} className="rounded-lg object-cover w-full h-auto">
                {Object.values(ceviche.image).map((imageSrc, index) => (
                  <div key={index} className="rounded-lg object-cover w-full h-auto">
                    <img
                      src={imageSrc}
                      alt={`${ceviche.name} ${index + 1}`}
                      className="rounded-lg object-cover w-full h-auto"
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              // Mostrar una sola imagen si solo hay una
              <div className="rounded-lg object-cover w-full h-auto">
                <img
                  src={typeof ceviche.image === 'string' ? ceviche.image : Object.values(ceviche.image)[0]}
                  alt={ceviche.name}
                  className="rounded-lg object-cover w-full h-auto"
                />
              </div>
            )}
            <h3 className="text-lg md:text-xl font-bold mt-4 text-center">{ceviche.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
