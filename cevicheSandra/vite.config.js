import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// firebase.json reescribe las rutas sin archivo propio a /app.html; se genera siempre
// (aunque no corra el pre-render) para que /venta, /resumen, etc. nunca se rompan.
const appHtmlCopy = () => ({
  name: 'app-html-copy',
  apply: 'build',
  closeBundle() {
    const dist = path.resolve('dist');
    fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, 'app.html'));
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), appHtmlCopy()],
  build: {
    rollupOptions: {
      output: {
        // Librerías en archivos separados: cambian poco y el navegador las mantiene en caché entre deploys
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
})
