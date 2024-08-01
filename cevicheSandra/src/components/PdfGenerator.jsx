import jsPDF from 'jspdf';
import { calculateDeliveryPrice } from './CevicheDelivery';

export const generatePDF = (order, customerDetails, customerLocation, locationsData) => {
  const doc = new jsPDF();
  
  // Información del cliente
  doc.text(`Nombre: ${customerDetails.name || 'No disponible'}`, 10, 10);
  doc.text(`Correo Electrónico: ${customerDetails.email || 'No disponible'}`, 10, 30);
  
  // Total de los ceviches
  let yPosition = 50; // Inicializa la posición vertical
  let totalPrice = 0;

  // Recorre los productos para calcular el precio total
  order.forEach((item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    const itemTotalPrice = quantity * price;
    totalPrice += itemTotalPrice;

    doc.text(`${item.name || 'Producto'} - ${item.size || 'Tamaño'} - ${quantity} x ${price.toFixed(2)} = ${itemTotalPrice.toFixed(2)}`, 10, yPosition);
    yPosition += 10;
  });

  doc.text(`Total Ceviches: ${totalPrice.toFixed(2)}`, 10, yPosition);
  yPosition += 10;

  let deliveryPrice = 0;
  if (customerLocation && locationsData && locationsData.length > 0) {
    deliveryPrice = calculateDeliveryPrice(customerLocation, locationsData);
    doc.text(`Costo de Entrega: ${deliveryPrice.toFixed(2)}`, 10, yPosition);
    yPosition += 10;
  }
  
  const grandTotal = totalPrice + deliveryPrice;
  doc.text(`Total con Entrega: ${grandTotal.toFixed(2)}`, 10, yPosition);

  // Convertir a data URI
  return doc.output('datauristring');
};
