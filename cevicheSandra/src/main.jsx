import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Asegúrate de que esta ruta es correcta
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import App from './App';

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

const appRoot = ReactDOM.createRoot(root);
appRoot.render(<App />);

