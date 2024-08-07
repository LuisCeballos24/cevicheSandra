// Home.js
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
    autoplaySpeed: 2000,
  };

  return (
    <div className="container mx-auto p-4 md:p-6 h-screen flex flex-col">
      <main className="flex flex-1 flex-col md:flex-row items-center justify-center mt-8 md:mt-12">
        <div className="md:w-1/2 md:pr-8">
          <h1 className="title text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-800">Bienvenido a Ceviche y Cocteles Donde Sandra</h1>
          <p className="text-gray-700 mt-4 text-base md:text-lg">Nuestros ceviches son de la más alta calidad y siempre frescos. ¡Ven y disfruta de un delicioso ceviche hoy mismo!</p>
          <div className="mt-8 space-x-2 md:space-x-4">
            <button onClick={() => navigate('/shop')} className="bg-black text-white px-4 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-900 transition duration-300">Ordena Ahora</button>
            <button className="border border-gray-800 text-gray-800 px-4 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-800 hover:text-white transition duration-300">Explora el Menú</button>
          </div>
        </div>
        <div className="md:w-1/2 w-full max-w-lg mt-8 md:mt-0 flex justify-center">
          <Slider {...settings} className="w-full max-w-xl">
            <div className="h-full">
              <img src="https://placehold.co/600x400" alt="Slide 1" className="rounded-lg shadow-lg w-full h-full object-cover" />
            </div>
            <div className="h-full">
              <img src="https://placehold.co/600x400" alt="Slide 2" className="rounded-lg shadow-lg w-full h-full object-cover" />
            </div>
            <div className="h-full">
              <img src="https://placehold.co/600x400" alt="Slide 3" className="rounded-lg shadow-lg w-full h-full object-cover" />
            </div>
          </Slider>
        </div>
      </main>
    </div>
  );
};

export default Home;
