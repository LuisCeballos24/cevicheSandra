import { useEffect } from 'react';
import { SITE } from './siteConfig';

const setMeta = (selector, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/);
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

// Título, descripción, canonical y robots por página (Google ejecuta JS y los lee)
export const usePageMeta = ({ title, description, path, noindex = false, image }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE.name}` : SITE.name;
    document.title = fullTitle;
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
    }
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    if (path !== undefined) {
      setMeta('link[rel="canonical"]', 'href', `${SITE.url}${path}`);
      setMeta('meta[property="og:url"]', 'content', `${SITE.url}${path}`);
    }
    if (image) setMeta('meta[property="og:image"]', 'content', `${SITE.url}${image}`);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, path, noindex, image]);
};
