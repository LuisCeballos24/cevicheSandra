import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '/logo.png'; // Ajusta la ruta del logo según la estructura de tu proyecto
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Puedes instalar react-icons para los íconos de redes sociales

const Footer = () => {
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    fetch('/ubicaciones.json')
      .then(response => response.json())
      .then(data => setUbicaciones(data))
      .catch(error => console.error('Error fetching ubicaciones:', error));
  }, []);

  return (
    <footer className="bg-[rgba(226,149,120,0.8)] rounded-lg shadow-lg py-8 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        {/* Logo */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0 flex justify-center md:justify-start">
          <img src={logo} alt="CevicheSandra Logo" className="h-32 w-32 md:h-64 md:w-64" />
        </div>

        {/* Información de Contacto */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ubicaciones</h2>
          <ul className="space-y-2">
            {ubicaciones.map((ubicacion, index) => (
              <li key={index}>
                <a
                  href={ubicacion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-yellow-600 transition duration-300"
                >
                  {ubicacion.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Opciones de Navegación */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Navegación</h2>
          <nav className="flex flex-col md:flex-row md:space-x-6">
            <Link to="/" className="text-gray-800 hover:text-yellow-600 transition duration-300 py-2">Home</Link>
            <Link to="/about" className="text-gray-800 hover:text-yellow-600 transition duration-300 py-2">About</Link>
            <Link to="/menu" className="text-gray-800 hover:text-yellow-600 transition duration-300 py-2">Menu</Link>
            <Link to="/contact" className="text-gray-800 hover:text-yellow-600 transition duration-300 py-2">Contact</Link>
            <Link to="/shop" className="border border-gray-800 rounded-full px-4 py-2 text-gray-800 hover:bg-gray-800 hover:text-white transition duration-300">Shop</Link>
          </nav>
        </div>

        {/* Redes Sociales */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:items-end">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Síguenos</h2>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
              <FaFacebookF size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
              <FaTwitter size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
              <FaInstagram size={24} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
              <FaLinkedin size={24} />
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
