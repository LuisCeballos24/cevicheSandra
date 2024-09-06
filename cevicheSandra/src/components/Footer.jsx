import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '/logo.png'; // Asegúrate de que la ruta del logo es correcta
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Asegúrate de tener react-icons instalados
import { FaMapMarkerAlt, FaHome, FaInfoCircle, FaConciergeBell, FaPhone, FaShoppingCart } from 'react-icons/fa'; // Iconos para secciones del footer

const Footer = () => {
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    fetch('/ubicaciones.json') // Asegúrate de que la ruta del archivo JSON es correcta
      .then(response => response.json())
      .then(data => setUbicaciones(data))
      .catch(error => console.error('Error fetching ubicaciones:', error));
  }, []);

  return (
    <footer className="bg-[rgba(226,149,120,0.8)] rounded-lg py-6 px-4 shadow-none hover:shadow-lg hover:shadow-black transition-shadow duration-300">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0">
        {/* Logo */}
        <div className="w-full md:w-1/4 flex justify-center md:justify-start">
          <img src={logo} alt="CevicheSandra Logo" className="h-24 w-24 md:h-32 md:w-32" />
        </div>

        {/* Información de Contacto */}
        <div className="w-full md:w-1/4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ubicaciones</h2>
          <ul className="space-y-3">
            {ubicaciones.map((ubicacion, index) => (
              <li key={index} className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-gray-800" />
                <a
                  href={ubicacion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 text-sm md:text-base shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
                >
                  {ubicacion.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Opciones de Navegación */}
        <div className="w-full md:w-1/4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Navegación</h2>
          <nav className="flex flex-col space-y-3">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 text-sm md:text-base shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaHome />
              <span>Home</span>
            </Link>
            <Link
              to="/nosotros"
              className="flex items-center space-x-2 text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 text-sm md:text-base shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaInfoCircle />
              <span>About</span>
            </Link>
            <Link
              to="/menu"
              className="flex items-center space-x-2 text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 text-sm md:text-base shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaConciergeBell />
              <span>Menu</span>
            </Link>
            <Link
              to="/contacto"
              className="flex items-center space-x-2 text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 text-sm md:text-base shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaPhone />
              <span>Contact</span>
            </Link>
            <Link
              to="/shop"
              className="flex items-center space-x-2 text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 text-sm md:text-base shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaShoppingCart />
              <span>Shop</span>
            </Link>
          </nav>
        </div>

        {/* Redes Sociales */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:items-end">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Síguenos</h2>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-white hover:bg-yellow-600 transition duration-300 shadow-none hover:shadow-lg hover:shadow-black p-2 rounded"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Derechos de Autor */}
      <div className="text-center mt-6">
        <p className="text-gray-800 text-sm">&copy; 2024 Ceviches y Cocteles Donde Sandra. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
