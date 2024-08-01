import React, { useState, useEffect } from 'react';

const CevicheUbicaciones = ({ setPickupLocations }) => {
  const [pickupLocations, setPickupLocationsState] = useState([]); // Define el estado para pickupLocations

  useEffect(() => {
    const fetchPickupLocations = async () => {
      try {
        const response = await fetch('/ubicaciones.json');
        const data = await response.json();
        setPickupLocationsState(data); // Actualiza el estado local
        setPickupLocations(data); // Pasa los datos al estado en el componente padre
      } catch (error) {
        console.error('Error fetching pickup locations:', error);
      }
    };

    fetchPickupLocations();
  }, [setPickupLocations]);

  return (
    <div className="mt-6 bg-red-200 bg-opacity-50 p-6 rounded-lg">
      <h3 className="text-2xl font-bold">Nuestras Ubicaciones:</h3>
      <ul>
        {pickupLocations.length > 0 ? (
          pickupLocations.map((location, index) => (
            <li key={index} className="mt-2 text-xl flex items-center justify-between">
              <a href={location.url} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                {location.name}
              </a>
              <a href={location.url} target="_blank" rel="noopener noreferrer">
                <button className="ml-4 bg-blue-500 text-white py-1 px-3 rounded-lg">
                  Ir
                </button>
              </a>
            </li>
          ))
        ) : (
          <p>Cargando ubicaciones...</p>
        )}
      </ul>
    </div>
  );
};

export default CevicheUbicaciones;
