import React from 'react';
import { Link } from 'react-router-dom';
import logo from '/logo.png'; // Ajusta la ruta del logo según la estructura de tu proyecto

const Header = ({ isAuthenticated, user, onLogin, onLogout }) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-4 px-4 md:px-6 bg-[rgba(226,149,120,0.8)] rounded-lg shadow-lg">
      {/* Logo and Branding */}
      <div className="flex items-center mb-4 md:mb-0">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="CevicheSandra Logo" className="h-10 w-10 md:h-16 md:w-16 object-contain" />
          <span className="ml-2 text-lg md:text-2xl font-bold text-gray-800">Ceviches y Cocteles Donde Sandra</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col md:flex-row md:space-x-6 w-full md:w-auto mb-4 md:mb-0">
        <Link to="/" className="text-gray-800 hover:text-yellow-600 transition duration-300 py-2 text-center">Home</Link>
        <Link to="/nosotros" className="border border-gray-800 rounded-full px-4 py-2 text-gray-800 hover:bg-gray-800 hover:text-white transition duration-300 text-center">About</Link>
        <a href="/menu" className="text-gray-800 hover:text-yellow-600 transition duration-300 py-2 text-center">Menu</a>
        <Link to="/contacto" className="border border-gray-800 rounded-full px-4 py-2 text-gray-800 hover:bg-gray-800 hover:text-white transition duration-300 text-center">Contacto</Link>
        <Link to="/shop" className="border border-gray-800 rounded-full px-4 py-2 text-gray-800 hover:bg-gray-800 hover:text-white transition duration-300 text-center">Shop</Link>
      </nav>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {user.photoURL ? (
              <img src={user.photoURL} alt="User Profile" className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm md:text-base">N/A</span>
              </div>
            )}
            <span className="text-gray-800 text-sm md:text-base">{user.displayName || 'User'}</span>
            <button onClick={onLogout} className="text-gray-800 border border-gray-800 rounded-full px-3 py-1 md:px-4 md:py-2 hover:bg-gray-800 hover:text-white transition duration-300">Cerrar Sesión</button>
          </>
        ) : (
          <button onClick={onLogin} className="text-gray-800 border border-gray-800 rounded-full px-3 py-1 md:px-4 md:py-2 hover:bg-gray-800 hover:text-white transition duration-300">Iniciar Sesión</button>
        )}
      </div>
    </header>
  );
};

export default Header;
