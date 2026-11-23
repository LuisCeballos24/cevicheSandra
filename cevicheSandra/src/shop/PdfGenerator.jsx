import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Asegúrate de instalar esta librería también

export const generatePDF = (order, customerDetails, totalOrderPrice, deliveryPrice) => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(18);
  doc.text('Factura de Ceviches', 10, 10);
  doc.setFontSize(12);
  
  // Información del cliente
  doc.text(`Nombre: ${customerDetails.name || 'No disponible'}`, 10, 20);
  doc.text(`Correo Electrónico: ${customerDetails.email || 'No disponible'}`, 10, 30);
  
  // Línea horizontal
  doc.setLineWidth(0.5);
  doc.line(10, 35, 200, 35);

  // Tabla de productos
  const tableColumn = ["Producto", "Tamaño", "Cantidad", "Precio Unitario", "Total"];
  const tableRows = [];
  
  order.forEach((item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    const itemTotalPrice = quantity * price;
    
    tableRows.push([item.name || 'Producto', item.size || 'Tamaño', quantity, price.toFixed(2), itemTotalPrice.toFixed(2)]);
  });

  // Agregar tabla al PDF
  doc.autoTable({
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    margin: { horizontal: 10 },
    styles: {
      fontSize: 10,
      cellPadding: 2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
    },
  });

  // Total de los ceviches
  let yPosition = doc.lastAutoTable.finalY + 10;
  doc.text(`Total Ceviches: ${totalOrderPrice.toFixed(2)}`, 10, yPosition);
  
  // Costo de Entrega
  if (deliveryPrice !== undefined) {
    yPosition += 10;
    doc.text(`Costo de Entrega: ${deliveryPrice.toFixed(2)}`, 10, yPosition);
  }
  
  // Total con Entrega
  const grandTotal = totalOrderPrice + (deliveryPrice || 0);
  yPosition += 10;
  doc.text(`Total con Entrega: ${grandTotal.toFixed(2)}`, 10, yPosition);

  // Convertir a data URI
  return doc.output('datauristring');
};
