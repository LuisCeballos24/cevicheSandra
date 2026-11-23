/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'header-bg': '#E29578',
        // Paleta del sitio público
        ocean: { DEFAULT: '#0f4c5c', dark: '#0a3540', light: '#16808f' },
        coral: { DEFAULT: '#f26b3a', dark: '#d9552a', light: '#ffe4d6' },
        sand: { DEFAULT: '#fff7ec', dark: '#f5e6d0' },
        lime: { DEFAULT: '#9bd14b' },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['Pacifico', 'cursive'],
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
