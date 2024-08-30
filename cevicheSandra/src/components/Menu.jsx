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
    infinite: false, // Cambiado a false para evitar la repetición
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true, // Ajustar la altura del slider según el contenido
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <h1 className="text-3xl font-bold">Menú de Ceviches</h1>
      </div>
      
      <p className="mb-6 text-xl">Descubre nuestros ceviches</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cevichesData.map((ceviche) => (
          <div
            key={ceviche.id}
            className="bg-red-200 bg-opacity-50 p-4 rounded-lg flex flex-col items-center cursor-pointer"
            onClick={() => handleCevicheClick(ceviche)}
          >
            <Slider {...settings} className="w-full">
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img
                  src={ceviche.image}
                  alt={ceviche.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </Slider>
            <h3 className="text-xl md:text-2xl font-bold mt-4">{ceviche.name}</h3>
            {/* Mostrar precios si es necesario */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
