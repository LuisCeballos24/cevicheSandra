import { useEffect, useState } from 'react';

// El menú se descarga una sola vez y se comparte entre páginas
let menuPromise = null;

export const loadMenu = () => {
  if (!menuPromise) {
    menuPromise = fetch('/cevichesData.json')
      .then(r => {
        if (!r.ok) throw new Error('No se pudo cargar el menú');
        return r.json();
      })
      .catch(e => {
        menuPromise = null; // reintentar en la próxima visita
        throw e;
      });
  }
  return menuPromise;
};

export const useMenuData = () => {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    loadMenu()
      .then(data => active && setMenu(data))
      .catch(e => active && setError(e));
    return () => { active = false; };
  }, []);

  return { menu, loading: menu.length === 0 && !error, error };
};

// Categorías del menú (por nombre del producto)
export const MENU_CATEGORIES = [
  { key: 'todos', label: 'Todos' },
  { key: 'ceviches', label: 'Ceviches' },
  { key: 'cocteles', label: 'Cócteles' },
  { key: 'extras', label: 'Extras' },
];

export const getCategory = (name = '') => {
  const n = name.toLowerCase();
  if (n.startsWith('ceviche')) return 'ceviches';
  if (n.startsWith('cóctel') || n.startsWith('coctel')) return 'cocteles';
  return 'extras';
};

// Primera imagen del producto (puede ser string u objeto con varias)
export const getMainImage = (image) => (typeof image === 'string' ? image : Object.values(image || {})[0]);

export const getImages = (image) => (typeof image === 'string' ? [image] : Object.values(image || {}));

export const minPrice = (prices = {}) => Math.min(...Object.values(prices).map(Number));

export const formatPrice = (n) => `$${Number(n).toFixed(2)}`;

// Tamaño "1" es producto por unidad (sodas, nachos, etc.)
export const sizeLabel = (size) => (size === '1' ? 'Unidad' : size.replace('galon', 'galón'));
