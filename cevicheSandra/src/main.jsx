import React from 'react';
import ReactDOM from 'react-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import './index.css'; // Asegúrate de que esta ruta es correcta
import logo from '/logo.png'; // Ajusta la ruta del logo según la estructura de tu proyecto

function App() {
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
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center py-4 bg-yellow-200 rounded-lg shadow-lg">
        <div className="flex items-center">
          <i className="fas fa-utensils text-3xl text-red-600"></i>
          <img src={logo} alt="CevicheSandra Logo" className="h-16 w-16 ml-2"/> {/* Ajusta el tamaño del logo aquí */}
          <span className="ml-4 text-3xl font-bold text-gray-800">CevicheSandra</span> {/* Ajusta el estilo del texto aquí */}
        </div>
        <nav className="space-x-6">
          <a href="#" className="text-gray-800 hover:text-yellow-600 transition duration-300">Home</a>
          <a href="#" className="text-gray-800 hover:text-yellow-600 transition duration-300">About</a>
          <a href="#" className="text-gray-800 hover:text-yellow-600 transition duration-300">Menu</a>
          <a href="#" className="text-gray-800 hover:text-yellow-600 transition duration-300">Contact</a>
          <a href="#" className="border border-gray-800 rounded-full px-4 py-1 text-gray-800 hover:bg-gray-800 hover:text-white transition duration-300">Shop</a>
        </nav>
      </header>
      <main className="flex flex-col md:flex-row items-center mt-12">
        <div className="md:w-1/2">
          <h1 className="title text-4xl md:text-5xl font-bold leading-tight text-gray-800">Bienvenido a Ceviche y Cocteles Donde Sandra</h1>
          <p className="text-gray-700 mt-4 text-lg">Nuestros ceviches son de la más alta calidad y siempre frescos. ¡Ven y disfruta de un delicioso ceviche hoy mismo!</p>
          <div className="mt-8 space-x-4">
            <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-900 transition duration-300">Ordena Ahora</button>
            <button className="border border-gray-800 text-gray-800 px-8 py-3 rounded-full hover:bg-gray-800 hover:text-white transition duration-300">Explora el Menú</button>
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <Slider {...settings}>
            <div>
              <img src="https://placehold.co/600x400" alt="Slide 1" className="rounded-lg shadow-lg" />
            </div>
            <div>
              <img src="https://placehold.co/600x400" alt="Slide 2" className="rounded-lg shadow-lg" />
            </div>
            <div>
              <img src="https://placehold.co/600x400" alt="Slide 3" className="rounded-lg shadow-lg" />
            </div>
          </Slider>
        </div>
      </main>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
