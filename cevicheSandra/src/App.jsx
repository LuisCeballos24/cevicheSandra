import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from './components/FirebaseConfig';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';

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

const AppLayout = ({ user, onLogin, onLogout }) => {
  const { pathname } = useLocation();
  const isInternal = INTERNAL_PATHS.includes(pathname);

  return (
    <>
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
        </Routes>
      </Suspense>
      {!isInternal && <Footer />}
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
