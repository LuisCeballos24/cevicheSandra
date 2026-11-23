import { useEffect, useRef } from 'react';

// Agrega la clase "is-visible" cuando el elemento entra en pantalla (una sola vez)
export const useReveal = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
};
