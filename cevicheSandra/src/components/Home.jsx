import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import Header from './Header';

const Home = ({ isAuthenticated, user, onLogin, onLogout }) => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false, // Desactiva las flechas de navegación si es necesario
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen flex flex-col">
      <main className="flex flex-1 flex-col md:flex-row items-center justify-center mt-8 md:mt-12">
        <div className="md:w-1/2 md:pr-8 w-full text-center md:text-left max-w-md">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-800">
            Bienvenido a Ceviche y Cocteles Donde Sandra
          </h1>
          <p className="text-gray-700 mt-4 text-base md:text-lg">
            Nuestros ceviches son de la más alta calidad y siempre frescos. ¡Ven y disfruta de un delicioso ceviche hoy mismo!
          </p>
          <div className="mt-8 space-y-4 md:space-x-4 md:space-y-0 flex flex-col md:flex-row items-center justify-center md:justify-start">
            <button
              onClick={() => navigate('/shop')}
              className="bg-black text-white px-6 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-900 transition duration-300 w-full md:w-auto"
            >
              Ordena Ahora
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="border border-gray-800 text-gray-800 px-6 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-800 hover:text-white transition duration-300 mt-2 md:mt-0 w-full md:w-auto"
            >
              Explora el Menú
            </button>
          </div>
          <p className="text-gray-700 mt-4 text-base md:text-lg">
            Las Imágenes son demostrativas
          </p>
        </div>
        <div className="md:w-1/2 w-full flex justify-center mt-8 md:mt-0">
          <Slider {...settings} className="w-full max-w-full">
          <div className="flex justify-center items-center w-full h-[300px] md:h-[400px]">
              <img
                src="/ejemploPedido.png"
                alt="Slide 1"
                className="object-cover w-full h-full rounded-lg shadow-lg" // Cambiado a object-cover
              />
            </div>
            <div className="flex justify-center items-center w-full h-[300px] md:h-[400px]">
              <img
                src="/cevicheConchaNegra.png"
                alt="Slide 2"
                className="object-cover w-full h-full rounded-lg shadow-lg" // Cambiado a object-cover
              />
            </div>
            <div className="flex justify-center items-center w-full h-[300px] md:h-[400px]">
              <img
                src="/ejemploPedido2.png"
                alt="Slide 3"
                className="object-cover w-full h-full rounded-lg shadow-lg" // Cambiado a object-cover
              />
            </div>
            <div className="flex justify-center items-center w-full h-[300px] md:h-[400px]">
              <img
                src="/coctelTropical.png"
                alt="Slide 4"
                className="object-cover w-full h-full rounded-lg shadow-lg" // Cambiado a object-cover
              />
            </div>
          </Slider>
        </div>
      </main>
    </div>
  );
};

export default Home;
