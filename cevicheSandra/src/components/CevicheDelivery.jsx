// Función para calcular la distancia entre dos puntos geográficos usando la fórmula de Haversine
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Distancia en metros
  return distance;
};

// Función para calcular el precio de la entrega basado en la distancia más corta a los puntos de referencia
export const calculateDeliveryPrice = (customerLocation, pickupLocations) => {
  let minDistance = Infinity;

  pickupLocations.forEach((location) => {
    const distance = calculateDistance(
      customerLocation.lat,
      customerLocation.lng,
      location.lat,
      location.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
    }
  });

  // Precio por metro (ajusta según sea necesario)
  const pricePerMeter = 0.01;
  return Math.round(minDistance * pricePerMeter * 100) / 100; // Redondear a dos decimales
};
