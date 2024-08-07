import React, { useEffect, useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Íconos de redes sociales

const Contacto = () => {
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    fetch('/ubicaciones.json')
      .then(response => response.json())
      .then(data => setUbicaciones(data))
      .catch(error => console.error('Error fetching ubicaciones:', error));
  }, []);

  return (
    <section className="bg-[rgba(226,149,120,0.8)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-screen-lg px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">Contáctanos</h1>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
          {/* Información de Contacto */}
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Información de Contacto</h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4">
              Correo electrónico: 
              <a href="mailto:cevichesycoctelesdondesandra@gmail.com" className="text-yellow-600 hover:text-yellow-800 break-words">
                cevichesycoctelesdondesandra@gmail.com
              </a>
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Ubicaciones</h3>
            <ul className="space-y-2">
              {ubicaciones.map((ubicacion, index) => (
                <li key={index}>
                  <a
                    href={ubicacion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-yellow-600 transition duration-300 text-base sm:text-lg break-words"
                  >
                    {ubicacion.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes Sociales */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Síguenos en Redes Sociales</h2>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
                <FaFacebookF size={30} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
                <FaTwitter size={30} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
                <FaInstagram size={30} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-yellow-600 transition duration-300">
                <FaLinkedin size={30} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
