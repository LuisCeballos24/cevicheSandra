import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import CryptoJS from 'crypto-js';

const DEFAULT_LOCATION = {
  lat: 9.123172177174112, // Latitud aproximada para Panamá Norte
  lng: -79.53663539710888 // Longitud aproximada para Panamá Norte
};

const secretKey = 'my>K5J2=4e8c-zSD%N"M+<'; // Usa la misma clave segura utilizada para cifrar

async function fetchEncryptedConfig() {
  try {
    const response = await fetch('/encrypted-config.json');
    if (!response.ok) {
      throw new Error('Error fetching encrypted config file');
    }
    const encryptedConfig = await response.text();
    if (!encryptedConfig) {
      throw new Error('Encrypted config file is empty');
    }

    const bytes = CryptoJS.AES.decrypt(encryptedConfig, secretKey);
    const decryptedConfig = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedConfig) {
      throw new Error('Decrypted config is empty');
    }

    const config = JSON.parse(decryptedConfig);
    return config;
  } catch (error) {
    console.error('Error fetching encrypted config:', error);
    throw error;
  }
}

const MapComponent = ({ selectedLocation, handleMapClick }) => {
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [mapSize, setMapSize] = useState({ width: '100%', height: '300px' }); // Estado para tamaño del mapa

  useEffect(() => {
    // Cargar y desencriptar la configuración
    fetchEncryptedConfig()
      .then(config => {
        setGoogleMapsApiKey(config.googleMapsApiKey);
      })
      .catch(error => {
        console.error('Error fetching encrypted config:', error);
      });

    // Ajustar tamaño del mapa según el ancho de la pantalla
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) { // Pantalla pequeña
        setMapSize({ width: '100%', height: '400px' });
      } else if (width < 1024) { // Pantalla mediana
        setMapSize({ width: '100%', height: '400px' });
      } else { // Pantalla grande
        setMapSize({ width: '800px', height: '500px' }); // Aumentar el alto y hacer que el mapa ocupe todo el ancho
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Llamada inicial

    return () => window.removeEventListener('resize', handleResize); // Limpiar el efecto
  }, []);

  const location = selectedLocation || DEFAULT_LOCATION;

  const handleMapClickInternal = (event) => {
    const latLng = event.latLng;
    handleMapClick({ lat: latLng.lat(), lng: latLng.lng() });
  };

  return (
    googleMapsApiKey && (
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <div className="map-container" style={{ width: mapSize.width, height: mapSize.height }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={location}
            zoom={15}
            onClick={handleMapClickInternal}
          >
            <Marker position={location} />
          </GoogleMap>
        </div>
      </LoadScript>
    )
  );
};

export default MapComponent;