import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// Ubicación predeterminada en Panamá Norte, por ejemplo, en el área de Caimitillo
const DEFAULT_LOCATION = {
    lat: 9.123172177174112,  // Latitud aproximada para Panamá Norte
    lng: -79.53663539710888  // Longitud aproximada para Panamá Norte
};

const MapComponent = ({ selectedLocation, handleMapClick }) => {
    // Usa la ubicación predeterminada si selectedLocation no está definido
    const location = selectedLocation || DEFAULT_LOCATION;

    const handleMapClickInternal = (event) => {
        const latLng = event.latLng;
        handleMapClick({ lat: latLng.lat(), lng: latLng.lng() });
    };

    return (
        <LoadScript googleMapsApiKey="AIzaSyCEowo0H2S9ve_rpnPTeUr0_AqKtM26uAo">
            <div className="map-container" style={{ height: '400px', width: '100%' }}>
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
    );
};

export default MapComponent;
