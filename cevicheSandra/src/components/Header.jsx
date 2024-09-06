import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaConciergeBell, FaPhone, FaShoppingCart, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'; // Importamos los íconos necesarios
import logo from '/logo.png'; // Ajusta la ruta del logo según la estructura de tu proyecto

const Header = ({ isAuthenticated, user, onLogin, onLogout }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-4 px-4 md:px-6 bg-[rgba(226,149,120,0.8)] rounded-lg shadow-lg">
      {/* Logo and Branding */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="CevicheSandra Logo" className="h-10 w-10 md:h-16 md:w-16 object-contain" />
          <span className="ml-2 text-lg md:text-2xl font-bold text-gray-800">
            Ceviches y Cocteles Donde Sandra
          </span>
        </Link>

        {/* Hamburger Menu Icon */}
        <button
          onClick={toggleMenu}
          className="text-gray-800 md:hidden focus:outline-none"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav
        className={`${
          isMenuOpen ? 'flex' : 'hidden'
        } flex-col md:flex md:flex-row md:space-x-6 w-full md:w-auto mt-4 md:mt-0`}
      >
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-800 hover:bg-gray-700 hover:text-yellow-600 transition duration-300 text-center text-sm md:text-base shadow-md hover:shadow-lg p-2 rounded"
        >
          <FaHome />
          <span>Home</span>
        </Link>
        <Link
          to="/nosotros"
          className="flex items-center space-x-2 text-gray-800 hover:bg-gray-700 hover:text-yellow-600 transition duration-300 text-center text-sm md:text-base shadow-md hover:shadow-lg p-2 rounded"
        >
          <FaInfoCircle />
          <span>About</span>
        </Link>
        <Link
          to="/menu"
          className="flex items-center space-x-2 text-gray-800 hover:bg-gray-700 hover:text-yellow-600 transition duration-300 text-center text-sm md:text-base shadow-md hover:shadow-lg p-2 rounded"
        >
          <FaConciergeBell />
          <span>Menu</span>
        </Link>
        <Link
          to="/contacto"
          className="flex items-center space-x-2 text-gray-800 hover:bg-gray-700 hover:text-yellow-600 transition duration-300 text-center text-sm md:text-base shadow-md hover:shadow-lg p-2 rounded"
        >
          <FaPhone />
          <span>Contact</span>
        </Link>
        <Link
          to="/shop"
          className="flex items-center space-x-2 text-gray-800 hover:bg-gray-700 hover:text-yellow-600 transition duration-300 text-center text-sm md:text-base shadow-md hover:shadow-lg p-2 rounded"
        >
          <FaShoppingCart />
          <span>Shop</span>
        </Link>
      </nav>

      {/* User Actions */}
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        {isAuthenticated ? (
          <>
            {/* Foto de Usuario */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="User Profile"
                className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <FaUserCircle className="text-gray-600 text-xl md:text-2xl" />
              </div>
            )}
            <span className="text-gray-800 text-sm md:text-base">
              {user.displayName || 'User'}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-800 border border-gray-800 rounded-full px-3 py-1 md:px-4 md:py-2 hover:bg-gray-800 hover:text-white transition duration-300"
            >
              <FaSignOutAlt className="text-lg md:text-xl" />
              <span>Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center space-x-2 text-gray-800 border border-gray-800 rounded-full px-3 py-1 md:px-4 md:py-2 hover:bg-gray-800 hover:text-white transition duration-300"
          >
            <FaUserCircle className="text-lg md:text-xl" />
            <span>Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
