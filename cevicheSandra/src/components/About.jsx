import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Íconos de redes sociales

const About = () => {
  return (
    <section className="bg-[rgba(226,149,120,0.8)] py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-10">Sobre Nosotros</h1>
        <div className="flex flex-col lg:flex-row lg:justify-between">
          {/* Información de la Empresa */}
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
            <p className="text-base md:text-lg text-gray-700 mb-6">
              Desde 2019, <strong>Ceviches y Cocteles Donde Sandra</strong> ha sido un referente en la gastronomía panameña, ofreciendo una experiencia culinaria única con ceviches de la más alta calidad y sabor exquisito. Nuestra cevichería está registrada y legalmente establecida en Panamá, cumpliendo con todas las normativas y regulaciones del país para garantizar una experiencia segura y confiable para nuestros clientes.
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Misión</h2>
            <p className="text-base md:text-lg text-gray-700 mb-6">
              Nuestra misión es ofrecer ceviches frescos y deliciosos que deleiten los sentidos de nuestros clientes, utilizando ingredientes de la más alta calidad y siguiendo recetas tradicionales con un toque innovador. Buscamos brindar una experiencia gastronómica inigualable, donde cada bocado de ceviche sea una celebración del sabor.
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Visión</h2>
            <p className="text-base md:text-lg text-gray-700 mb-6">
              Aspiramos a ser la cevichería más reconocida y apreciada en Panamá, destacándonos por nuestra calidad excepcional y nuestro compromiso con la autenticidad. Queremos expandir nuestra presencia y llegar a nuevos clientes, manteniendo siempre el estándar más alto en sabor y servicio.
            </p>
          </div>

          {/* Información de Contacto y Redes Sociales */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Contáctanos</h2>
            <p className="text-base md:text-lg text-gray-700 mb-4">
              Correo electrónico: <a href="mailto:cevichesycoctelesdondesandra@gmail.com" className="text-yellow-600 hover:text-yellow-800 break-all md:break-normal">cevichesycoctelesdondesandra@gmail.com</a>
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Síguenos en Redes Sociales</h3>
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
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
            <p className="text-center text-gray-800 text-sm md:text-base">
              &copy; 2024 Ceviches y Cocteles Donde Sandra. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
