import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaShoppingBag } from 'react-icons/fa';
import { SITE } from '../config/siteConfig';
import { WhatsAppButton } from './SiteUi';

const logo = '/img/logo.webp';

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/menu', label: 'Menú' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

const Header = ({ isAuthenticated, user, onLogin, onLogout }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Cierra el menú móvil al cambiar de página
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-full text-sm font-semibold transition ${isActive ? 'bg-coral-light text-coral-dark' : 'text-gray-700 hover:text-ocean hover:bg-sand'}`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-sand-dark">
      <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <img src={logo} alt={`Logo ${SITE.name}`} width="56" height="56" className="h-11 w-11 md:h-14 md:w-14 object-contain" />
          <span className="font-extrabold text-ocean leading-tight text-sm sm:text-base md:text-lg">
            Ceviches y Cócteles<br className="sm:hidden" /> <span className="text-coral">Donde Sandra</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Principal">
          {NAV_LINKS.map(l => <NavLink key={l.to} to={l.to} end className={linkClass}>{l.label}</NavLink>)}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/shop" className="inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-semibold px-5 py-2.5 rounded-full shadow transition text-sm">
            <FaShoppingBag /> Ordenar
          </Link>
          {isAuthenticated ? (
            <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-ocean px-2" title="Cerrar sesión">
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                : <FaUserCircle size={24} />}
              <FaSignOutAlt />
            </button>
          ) : (
            <button onClick={onLogin} className="text-gray-500 hover:text-ocean px-2" title="Iniciar sesión">
              <FaUserCircle size={24} />
            </button>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="md:hidden text-ocean p-2"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-sand-dark bg-white px-4 py-4 space-y-2">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold ${isActive ? 'bg-coral-light text-coral-dark' : 'text-gray-700'}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/shop" className="flex items-center justify-center gap-2 bg-coral text-white font-semibold px-5 py-3 rounded-full">
            <FaShoppingBag /> Ordenar en línea
          </Link>
          <WhatsAppButton className="w-full" />
          <div className="pt-2 text-center">
            {isAuthenticated ? (
              <button onClick={onLogout} className="text-sm text-gray-500 inline-flex items-center gap-2"><FaSignOutAlt /> Cerrar sesión ({user.displayName || 'Usuario'})</button>
            ) : (
              <button onClick={onLogin} className="text-sm text-gray-500 inline-flex items-center gap-2"><FaUserCircle /> Iniciar sesión</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
