import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Link } from 'react-router-dom';
import { getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from './components/FirebaseConfig';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import { FloatingWhatsApp } from './components/SiteUi';
import { usePageMeta } from './usePageMeta';

// Cada página se descarga solo cuando se visita
const CevicheOrden = lazy(() => import('./components/CevicheOrden'));
const Contacto = lazy(() => import('./components/Contacto'));
const About = lazy(() => import('./components/About'));
const Menu = lazy(() => import('./components/Menu'));
const Venta = lazy(() => import('./components/CevicheVenta'));
const CevicheDetail = lazy(() => import('./components/CevicheDetail'));
const MetricasNegocio = lazy(() => import('./components/MetricasNegocio'));
const ResumenVentas = lazy(() => import('./components/ResumenVentas'));

// Páginas internas (ventas y reportes) se muestran sin el header/footer del sitio
const INTERNAL_PATHS = ['/venta', '/resumen', '/metricas'];

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
  </div>
);

// Meta de páginas sin componente propio de SEO (tienda e internas)
const ROUTE_META = {
  '/shop': { title: 'Ordenar en línea', description: 'Haz tu pedido de ceviches y cócteles en línea: elige tamaño, cantidad y si necesitas delivery.', path: '/shop' },
  '/venta': { title: 'Ventas', noindex: true },
  '/resumen': { title: 'Resumen', noindex: true },
  '/metricas': { title: 'Métricas', noindex: true },
};

const RouteMeta = ({ pathname }) => {
  usePageMeta(ROUTE_META[pathname] || {});
  return null;
};

const NotFound = () => {
  usePageMeta({ title: 'Página no encontrada', noindex: true });
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-ocean">Página no encontrada</h1>
      <p className="text-gray-600 mt-3">La página que buscas no existe.</p>
      <Link to="/" className="inline-block mt-6 bg-coral text-white font-semibold px-6 py-3 rounded-full">Ir al inicio</Link>
    </div>
  );
};

const AppLayout = ({ user, onLogin, onLogout }) => {
  const { pathname } = useLocation();
  const isInternal = INTERNAL_PATHS.includes(pathname);

  // Cada página nueva empieza arriba
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      {ROUTE_META[pathname] && <RouteMeta pathname={pathname} />}
      {!isInternal && (
        <Header
          isAuthenticated={!!user}
          user={user || {}}
          onLogin={onLogin}
          onLogout={onLogout}
        />
      )}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<CevicheOrden />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/venta" element={<Venta />} />
          <Route path="/ceviche/:id" element={<CevicheDetail />} />
          <Route path="/metricas" element={<MetricasNegocio />} />
          <Route path="/resumen" element={<ResumenVentas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isInternal && <Footer />}
      {!isInternal && <FloatingWhatsApp />}
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Error durante el inicio de sesión: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error durante el cierre de sesión: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  return (
    <Router>
      <AppLayout user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </Router>
  );
};

export default App;
