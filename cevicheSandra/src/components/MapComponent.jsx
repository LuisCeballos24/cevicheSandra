import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import CryptoJS from 'crypto-js';

// Ubicación predeterminada en Panamá Norte, por ejemplo, en el área de Caimitillo
const DEFAULT_LOCATION = {
  lat: 9.123172177174112, // Latitud aproximada para Panamá Norte
  lng: -79.53663539710888 // Longitud aproximada para Panamá Norte
};

const secretKey = 'my>K5J2=4e8c-zSD%N"M+<' // Usa la misma clave segura utilizada para cifrar

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

  useEffect(() => {
    // Cargar y desencriptar la configuración
    fetchEncryptedConfig()
      .then(config => {
        setGoogleMapsApiKey(config.googleMapsApiKey);
      })
      .catch(error => {
        console.error('Error fetching encrypted config:', error);
      });
  }, []);

  // Usa la ubicación predeterminada si selectedLocation no está definido
  const location = selectedLocation || DEFAULT_LOCATION;

  const handleMapClickInternal = (event) => {
    const latLng = event.latLng;
    handleMapClick({ lat: latLng.lat(), lng: latLng.lng() });
  };

  return (
    googleMapsApiKey && (
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <div className="map-container" style={{ height: '300px', width: '400px' }}>
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
