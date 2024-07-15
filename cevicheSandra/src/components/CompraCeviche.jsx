import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const CompraCeviche = () => {
    const [cevichesData, setCevichesData] = useState([]);
    const [provinciasData, setProvinciasData] = useState([]);
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [corregimiento, setCorregimiento] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedLocationInfo, setSelectedLocationInfo] = useState('');
    const [requireDelivery, setRequireDelivery] = useState(false);
    const [errors, setErrors] = useState({
        name: false,
        phone: false,
        email: false,
        province: false,
        district: false,
        corregimiento: false
    });

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

    const handleSizeChange = (id, size) => {
        const updatedOrder = order.map((item) =>
            item.id === id ? { ...item, size } : item
        );
        setOrder(updatedOrder);
        updateTotal(updatedOrder);
    };

    const handleQuantityChange = (id, quantity) => {
        const updatedOrder = order.map((item) =>
            item.id === id ? { ...item, quantity } : item
        );
        setOrder(updatedOrder);
        updateTotal(updatedOrder);
    };

    const updateTotal = (order) => {
        const newTotal = order.reduce((acc, item) => {
            const ceviche = cevichesData.find((ceviche) => ceviche.id === item.id);
            const price = ceviche.prices[item.size];
            return acc + price * item.quantity;
        }, 0);
        setTotal(newTotal);
    };

    const handleProvinceChange = (value) => {
        const selectedProvince = provinciasData.find((provincia) => provincia.name === value);
        setProvince(value);
        if (selectedProvince) {
            setDistrict('');
            setCorregimiento('');
        }
    };

    const handleDistrictChange = (value) => {
        setDistrict(value);
        setCorregimiento('');
    };

    const handleCorregimientoChange = (value) => {
        setCorregimiento(value);
        const corregimientoData = provinciasData
            .find((provincia) => provincia.name === province)
            ?.districts.find((distrito) => distrito.name === district)
            ?.corregimientos.find((corr) => corr === value);
        if (corregimientoData && corregimientoData.location) {
            setSelectedLocation(corregimientoData.location);
            setSelectedLocationInfo(corregimientoData.name);
        }
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSelectedLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setSelectedLocationInfo('Mi Ubicación Actual');
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    alert('No se pudo obtener la ubicación actual.');
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            alert('Geolocalización no es compatible con este navegador.');
        }
    };

    const validatePhone = (phone) => {
        // Expresión regular para validar un número de teléfono en formato panameño
        const phoneRegex = /^[6789]\d{7}$/;
        return phoneRegex.test(phone);
    };

    const validateEmail = (email) => {
        // Expresión regular para validar un correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handlePhoneChange = (value) => {
        setPhone(value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            phone: !validatePhone(value)
        }));
    };

    const handleEmailChange = (value) => {
        setEmail(value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            email: !validateEmail(value)
        }));
    };

    const handleSubmit = () => {
        let formValid = true;
        const newErrors = {
            name: !name,
            phone: !validatePhone(phone),
            email: !validateEmail(email),
            province: requireDelivery && !province,
            district: requireDelivery && !district,
            corregimiento: requireDelivery && !corregimiento
        };

        Object.values(newErrors).forEach((error) => {
            if (error) {
                formValid = false;
            }
        });

        if (formValid) {
            setErrors({
                name: false,
                phone: false,
                email: false,
                province: false,
                district: false,
                corregimiento: false
            });
            console.log('Orden enviada:', { order, name, phone, email, province, district, corregimiento, selectedLocation, selectedLocationInfo });
            // Aquí puedes añadir la lógica para enviar la orden con todos los datos recopilados.
        } else {
            setErrors(newErrors);
        }
    };

    const handleMapClick = (event) => {
        setSelectedLocation(event.latLng.toJSON());
        fetchLocationInfo(event.latLng);
    };

    const fetchLocationInfo = async (latLng) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLng.lat},${latLng.lng}&key=AIzaSyCEowo0H2S9ve_rpnPTeUr0_AqKtM26uAo`);
            if (response.data.results && response.data.results.length > 0) {
                const address = response.data.results[0].formatted_address;
                setSelectedLocationInfo(address);
            }
        } catch (error) {
            console.error('Error fetching location info:', error);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100">
            <div className="flex items-center mb-4">
                <i className="fas fa-arrow-left text-lg"></i>
                <span className="ml-2 text-lg font-semibold">¡Compra Ceviche!</span>
            </div>
            <hr className="mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Elige tu Ceviche</h2>
                    <p className="text-gray-500 mb-4">Selecciona uno de nuestros deliciosos ceviches:</p>
                    {cevichesData.map((ceviche) => (
                        <div key={ceviche.id} className="flex items-center p-4 bg-white rounded-lg shadow">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0"></div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-semibold">{ceviche.name}</h3>
                                <div className="flex items-center mt-2">
                                    <select
                                        className="border border-gray-300 rounded px-2 py-1 mr-2"
                                        value={order.find((item) => item.id === ceviche.id)?.size || '7oz'}
                                        onChange={(e) => handleSizeChange(ceviche.id, e.target.value)}
                                    >
                                        <option value="7oz">7oz</option>
                                        <option value="14oz">14oz</option>
                                    </select>
                                    <input
                                        type="number"
                                        min="0"
                                        className="border border-gray-300 rounded px-2 py-1 w-20"
                                        value={order.find((item) => item.id === ceviche.id)?.quantity || 0}
                                        onChange={(e) => handleQuantityChange(ceviche.id, parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Detalles del Pedido</h2>
                    <p className="text-gray-500 mb-4">Completa tus datos y elige la ubicación de entrega:</p>
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className={`border border-gray-300 rounded px-3 py-2 ${errors.name ? 'border-red-500' : ''}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && <p className="text-red-500 text-sm">Por favor ingresa tu nombre.</p>}
                        <input
                            type="text"
                            placeholder="Teléfono"
                            className={`border border-gray-300 rounded px-3 py-2 ${errors.phone ? 'border-red-500' : ''}`}
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        {errors.phone && <p className="text-red-500 text-sm">Por favor ingresa un número de teléfono válido (ej. 61234567).</p>}
                        <input
                            type="text"
                            placeholder="Correo Electrónico"
                            className={`border border-gray-300 rounded px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-sm">Por favor ingresa un correo electrónico válido.</p>}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={requireDelivery}
                                onChange={(e) => setRequireDelivery(e.target.checked)}
                            />
                            <label className="ml-2">¿Requiere entrega?</label>
                        </div>
                        {requireDelivery && (
                            <>
                                <select
                                    className={`border border-gray-300 rounded px-3 py-2 ${errors.province ? 'border-red-500' : ''}`}
                                    value={province}
                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                >
                                    <option value="">Selecciona Provincia</option>
                                    {provinciasData.map((provincia) => (
                                        <option key={provincia.name} value={provincia.name}>{provincia.name}</option>
                                    ))}
                                </select>
                                {errors.province && <p className="text-red-500 text-sm">Por favor selecciona la provincia.</p>}
                                {province && (
                                    <>
                                        <select
                                            className={`border border-gray-300 rounded px-3 py-2 ${errors.district ? 'border-red-500' : ''}`}
                                            value={district}
                                            onChange={(e) => handleDistrictChange(e.target.value)}
                                        >
                                            <option value="">Selecciona Distrito</option>
                                            {provinciasData.find((provincia) => provincia.name === province)?.districts.map((distrito) => (
                                                <option key={distrito.name} value={distrito.name}>{distrito.name}</option>
                                            ))}
                                        </select>
                                        {errors.district && <p className="text-red-500 text-sm">Por favor selecciona el distrito.</p>}
                                        {district && (
                                            <select
                                                className={`border border-gray-300 rounded px-3 py-2 ${errors.corregimiento ? 'border-red-500' : ''}`}
                                                value={corregimiento}
                                                onChange={(e) => handleCorregimientoChange(e.target.value)}
                                            >
                                                <option value="">Selecciona Corregimiento</option>
                                                {provinciasData.find((provincia) => provincia.name === province)?.districts.find((distrito) => distrito.name === district)?.corregimientos.map((corr) => (
                                                    <option key={corr} value={corr}>{corr}</option>
                                                ))}
                                            </select>
                                        )}
                                        {errors.corregimiento && <p className="text-red-500 text-sm">Por favor selecciona el corregimiento.</p>}
                                    </>
                                )}
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
                                    onClick={handleUseCurrentLocation}
                                >
                                    Usar Ubicación Actual
                                </button>
                                <LoadScript googleMapsApiKey="AIzaSyCEowo0H2S9ve_rpnPTeUr0_AqKtM26uAo">
                                    <GoogleMap
                                        mapContainerClassName="mt-4 h-96"
                                        center={selectedLocation || { lat: 8.9824, lng: -79.5199 }}
                                        zoom={12}
                                        onClick={handleMapClick}
                                    >
                                        {selectedLocation && (
                                            <Marker position={selectedLocation} />
                                        )}
                                    </GoogleMap>
                                </LoadScript>
                                {selectedLocationInfo && (
                                    <p className="mt-2">Ubicación Seleccionada: {selectedLocationInfo}</p>
                                )}
                            </>
                        )}
                        <button
                            className="bg-green-500 text-white px-6 py-3 rounded mt-4 hover:bg-green-600"
                            onClick={handleSubmit}
                        >
                            Confirmar Orden
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Total a Pagar</h2>
                <p className="text-gray-500">El total incluye el costo de todos los ceviches seleccionados y el envío si aplica:</p>
                <p className="text-2xl font-bold text-green-600">${total.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default CompraCeviche;
