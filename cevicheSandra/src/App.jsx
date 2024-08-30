import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from './components/FirebaseConfig'; // Ajusta la ruta según tu estructura de carpetas
import Header from './components/Header';
import Home from './components/Home';
import CompraCeviche from './components/CompraCeviche';
import Footer from './components/Footer';
import Contacto from './components/Contacto';
import About from './components/About';
import Menu from './components/Menu'
import CevicheDetail from './components/CevicheDetail';

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
      <Header
        isAuthenticated={!!user}
        user={user || {}}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<CompraCeviche />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/ceviche/:id" element={<CevicheDetail />} />
      </Routes>
      <Footer/>
    </Router>
  );
};

export default App;
