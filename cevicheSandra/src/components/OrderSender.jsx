import React from 'react';
import { sendEmail } from './EmailServices';
import { generatePDF } from './PdfGenerator';
import { uploadToGoogleDrive, initClient } from './ApiDrive'; // Importar funciones necesarias

// Coordenadas fijas para las ubicaciones
const locations = [
  {
    name: "Ceviches y Cocteles Donde Sandra, Praderas de San Lorenzo",
    coordinates: [9.122934, -79.536636],
  },
  {
    name: "Ceviches y Cocteles Donde Sandra, Altos de la Calzada",
    coordinates: [9.147490, -79.538451],
  }
];

// Función para calcular la distancia entre dos puntos geográficos
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
};

// Función para encontrar la ubicación más cercana
const findNearestLocation = (customerLocation) => {
  let nearestLocation = null;
  let minDistance = Infinity;

  locations.forEach(location => {
    const [lat, lng] = location.coordinates;
    const distance = calculateDistance(
      customerLocation.lat,
      customerLocation.lng,
      lat,
      lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = location;
    }
  });

  return nearestLocation;
};

// Función para calcular el costo de entrega
const calculateDeliveryPrice = (customerLocation) => {
  const nearestLocation = findNearestLocation(customerLocation);
  const deliveryCostPerKm = 1.5; // Precio por kilómetro

  if (!nearestLocation) return 0;

  const [lat, lng] = nearestLocation.coordinates;
  const distance = calculateDistance(
    customerLocation.lat,
    customerLocation.lng,
    lat,
    lng
  );

  return distance * deliveryCostPerKm;
};

const OrderSender = async (order, customerDetails, customerLocation, email) => {
  try {
    // Inicializar cliente de Google API
    await initClient();
    console.log('Google API client initialized.');

    // Filtrar ceviches seleccionados
    const selectedOrder = order.filter(item => item.size && item.quantity > 0);

    // Calcular el costo de entrega
    const deliveryPrice = calculateDeliveryPrice(customerLocation);

    // Generar el PDF
    const pdfData = generatePDF(selectedOrder, customerDetails, customerLocation, locations);
    
    // Convertir data URI a Blob
    const pdfBlob = await fetch(pdfData).then(res => res.blob());
    const pdfFile = new File([pdfBlob], 'order-details.pdf', { type: 'application/pdf' });

    // Subir el archivo a Google Drive
    let driveLink = '';
    try {
      driveLink = await uploadToGoogleDrive(pdfFile);
      console.log('Archivo subido a Google Drive:', driveLink);
    } catch (error) {
      console.error('Error al subir el archivo a Google Drive:', error.message || error);
    }

    // Crear el cuerpo del correo electrónico
    const emailBody = `
      ¡Gracias por tu pedido!

      Detalles del Pedido:
      Nombre: ${customerDetails.name}
      Correo Electrónico: ${customerDetails.email}

      Productos:
      ${selectedOrder.map(item => `${item.name} - ${item.size} - ${item.quantity}`).join('\n')}

      Costo de Entrega: ${deliveryPrice.toFixed(2)}

      Recibirás un PDF con los detalles del pedido en el siguiente enlace: [Ver PDF](${driveLink})

      ¡Gracias por tu compra!
    `;

    // Enviar el correo electrónico
    await sendEmail({
      to: email,
      subject: 'Confirmación de Pedido',
      body: emailBody
    });

    console.log('Correo enviado con éxito!');
  } catch (error) {
    console.error('Error al procesar el pedido:', error.message || error);
  }
};

export default OrderSender;
