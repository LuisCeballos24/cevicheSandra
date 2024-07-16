import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import jsPDF from 'jspdf';
import emailjs from 'emailjs-com';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBEdwCANDcQofNB7lOSjlQcpL-I8-uORCI",
    authDomain: "propios-ba684.firebaseapp.com",
    projectId: "propios-ba684",
    storageBucket: "propios-ba684.appspot.com",
    messagingSenderId: "451125740462",
    appId: "1:451125740462:web:9c62b5729e0d4d862fbe3f",
    measurementId: "G-GKG5B7DLF9"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const CompraCeviche = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [corregimiento, setCorregimiento] = useState('');
    const [requireDelivery, setRequireDelivery] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [errors, setErrors] = useState({});
    const [cevichesData, setCevichesData] = useState([]);
    const [provinciasData, setProvinciasData] = useState([]);
    const [order, setOrder] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const fetchCevichesData = async () => {
            try {
                const response = await axios.get('/cevichesData.json');
                setCevichesData(response.data);
                setOrder(response.data.map((ceviche) => ({
                    id: ceviche.id,
                    name: ceviche.name,
                    size: '7oz',
                    quantity: 0
                })));
            } catch (error) {
                console.error('Error fetching ceviches data:', error);
            }
        };

        const fetchProvinciasData = async () => {
            try {
                const response = await axios.get('/provincias.json');
                setProvinciasData(response.data);
            } catch (error) {
                console.error('Error fetching provincias data:', error);
            }
        };

        fetchCevichesData();
        fetchProvinciasData();
    }, []);

    const handleAddToOrder = (product, size) => {
        const existingOrder = order.find(item => item.id === product.id && item.size === size);
        if (existingOrder) {
            setOrder(order.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setOrder([...order, { id: product.id, name: product.name, size, quantity: 1 }]);
        }
    };

    const handleRemoveFromOrder = (product, size) => {
        setOrder(order.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0));
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                setSelectedLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    };

    const handleMapClick = (event) => {
        setSelectedLocation({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        });
    };

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setLoggedIn(true);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    const handleSubmit = async () => {
        let validationErrors = {};
        if (!name) validationErrors.name = true;
        if (!phone) validationErrors.phone = true;
        if (!email) validationErrors.email = true;
        // Agrega validaciones adicionales según sea necesario
    
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        // Si necesitas iniciar sesión antes de enviar el correo
        if (!loggedIn) {
            await handleLogin();
        }
    
        // Generar PDF u otros datos necesarios
        const doc = new jsPDF();
        doc.text('Resumen de Pedido', 10, 10);
        order.forEach((item, index) => {
            doc.text(`${item.name} - ${item.size} - ${item.quantity}`, 10, 20 + (index * 10));
        });
        const pdfData = doc.output('datauristring');
    
        // Envío del correo utilizando EmailJS
        try {
            const result = await emailjs.send('service_g5payzo', 'template_z40xbbg', {
                to_name: name,
                message: 'Gracias por tu pedido. Adjunto encontrarás el resumen.',
                to_email: email,
                attachment: pdfData
            }, '5mHKxB7E0vSnpXpsZ');
            console.log(pdfData);
            console.log('Correo enviado exitosamente:', result.text);
            alert('Orden enviada con éxito');
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            alert('Error al enviar el correo. Por favor, inténtalo de nuevo más tarde.');
        }    
    };    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl mb-4">Compra de Ceviches</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cevichesData.map((product) => (
                    <div key={product.id} className="border p-4 rounded">
                        <img src={product.image} alt={product.name} className="w-full h-32 object-cover mb-2" />
                        <h2 className="text-xl">{product.name}</h2>
                        <div className="mt-2">
                            {Object.keys(product.prices).map(size => (
                                <button key={size} onClick={() => handleAddToOrder(product, size)} className="mr-2 mb-2 bg-blue-500 text-white px-2 py-1 rounded">{size}</button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl">Resumen de Pedido</h2>
                    {order.length === 0 ? (
                        <p>No hay productos en el pedido.</p>
                    ) : (
                        <ul>
                            {order.map(item => (
                                <li key={`${item.id}-${item.size}`}>
                                    {item.name} - {item.size} - {item.quantity}
                                    <button onClick={() => handleRemoveFromOrder(item, item.size)} className="ml-2 text-red-500">Eliminar</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <label className="block">Nombre</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" />
                    {errors.name && <span className="text-red-500">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="block">Teléfono</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded" />
                    {errors.phone && <span className="text-red-500">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="block">Correo Electrónico</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
                    {errors.email && <span className="text-red-500">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="block">Provincia</label>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full border p-2 rounded">
                        <option value="">Selecciona una provincia</option>
                        {provinciasData.map((provincia) => (
    <option key={provincia.id} value={provincia.name}>{provincia.name}</option>
))}
                    </select>
                    {errors.province && <span className="text-red-500">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="block">Distrito</label>
                    <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full border p-2 rounded" />
                    {errors.district && <span className="text-red-500">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="block">Corregimiento</label>
                    <input type="text" value={corregimiento} onChange={(e) => setCorregimiento(e.target.value)} className="w-full border p-2 rounded" />
                    {errors.corregimiento && <span className="text-red-500">Este campo es requerido</span>}
                </div>
                <div>
                    <label className="block">¿Requiere entrega a domicilio?</label>
                    <input type="checkbox" checked={requireDelivery} onChange={(e) => setRequireDelivery(e.target.checked)} />
                </div>
                {requireDelivery && (
                    <div>
                        <button onClick={handleUseCurrentLocation} className="bg-blue-500 text-white px-2 py-1 rounded">Usar ubicación actual</button>
                        {selectedLocation && (
                            <LoadScript googleMapsApiKey="AIzaSyCEowo0H2S9ve_rpnPTeUr0_AqKtM26uAo">
                                <GoogleMap
                                    mapContainerStyle={{ height: "300px", marginTop: "10px" }}
                                    center={selectedLocation}
                                    zoom={15}
                                    onClick={handleMapClick}
                                >
                                    <Marker position={selectedLocation} />
                                </GoogleMap>
                            </LoadScript>
                        )}
                    </div>
                )}
            </div>
            <div className="mt-8">
                <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">Enviar Pedido</button>
            </div>
        </div>
    );
};

export default CompraCeviche;
