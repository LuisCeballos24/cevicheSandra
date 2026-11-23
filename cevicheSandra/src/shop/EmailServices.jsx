import emailjs from 'emailjs-com';

// Credenciales de EmailJS (panel: https://dashboard.emailjs.com)
const SERVICE_ID = 'service_g5payzo';
const TEMPLATE_ID = 'template_z40xbbg';
const PUBLIC_KEY = '-pNylqk6yaRDlxkJP';

// Envía un correo con la plantilla de EmailJS. Parámetros de la plantilla: to_email, subject, message.
// Se corta a los 8 segundos para no dejar al cliente esperando.
export const sendEmail = ({ to, subject, body }) => Promise.race([
  emailjs.send(SERVICE_ID, TEMPLATE_ID, { to_email: to, subject, message: body }, PUBLIC_KEY),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera agotado')), 8000)),
]);
