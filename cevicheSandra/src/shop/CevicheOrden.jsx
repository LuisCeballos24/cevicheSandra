import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { FaWhatsapp, FaSearch, FaPlus, FaMinus, FaTrash, FaShoppingBag, FaTimes, FaStore, FaMotorcycle, FaLocationArrow, FaCheckCircle, FaChevronUp, FaStar } from 'react-icons/fa';
import { db } from '../config/firebase';
import { SITE, whatsappLink } from '../config/siteConfig';
import { useMenuData, MENU_CATEGORIES, getCategory, getMainImage, formatPrice, sizeLabel } from '../hooks/useMenuData';
import { addItemToOrder, changeItemQuantity, orderTotal } from '../ventas/ventaHelpers';
import { PageHero } from '../layout/SiteUi';
import { estimateDelivery, buildWebOrderMessage, buildWebOrderEmail } from './orderUtils';
import { sendEmail } from './EmailServices';

const CART_KEY = 'webCart';
const CUSTOMER_KEY = 'webCustomer';

// localStorage puede fallar (modo privado); el carrito es solo una comodidad
const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const writeStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
};

const EMPTY_CUSTOMER = { name: '', phone: '', email: '', notes: '' };

const CevicheOrden = () => {
  const { menu, loading: menuLoading } = useMenuData();
  const [order, setOrder] = useState(() => readStorage(CART_KEY, []));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todos');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  // Datos del cliente (se recuerdan para el próximo pedido, sin las notas)
  const [customer, setCustomer] = useState(() => ({ ...EMPTY_CUSTOMER, ...readStorage(CUSTOMER_KEY, {}), notes: '' }));
  const [delivery, setDelivery] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(SITE.locations[0].name);
  const [point, setPoint] = useState(null);
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [formError, setFormError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sentLink, setSentLink] = useState(null);

  useEffect(() => { writeStorage(CART_KEY, order); }, [order]);

  // Aviso breve al agregar un producto
  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(() => setLastAdded(null), 1800);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const products = useMemo(() => {
    const term = search.trim().toLowerCase();
    return menu.filter(p =>
      (category === 'todos' || getCategory(p.name) === category) &&
      (!term || p.name.toLowerCase().includes(term))
    );
  }, [menu, search, category]);

  const inCartById = useMemo(() => order.reduce((acc, i) => {
    acc[i.cevicheId] = (acc[i.cevicheId] || 0) + i.quantity;
    return acc;
  }, {}), [order]);

  const total = orderTotal(order);
  const itemCount = order.reduce((s, i) => s + i.quantity, 0);
  const deliveryEstimate = delivery ? estimateDelivery(point) : null;

  const handleAdd = (product, size) => {
    setOrder(prev => addItemToOrder(prev, product, size, 1, {}));
    setLastAdded(`${product.name}${size !== '1' ? ` ${sizeLabel(size)}` : ''}`);
  };

  const handleChangeQuantity = (itemId, delta) => setOrder(prev => changeItemQuantity(prev, itemId, delta));

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Tu navegador no permite obtener la ubicación. Escribe tu dirección.');
      return;
    }
    setLocating(true);
    setFormError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      err => {
        setLocating(false);
        setFormError(err.code === err.PERMISSION_DENIED
          ? 'No diste permiso de ubicación. Escribe tu dirección o actívalo en el navegador.'
          : 'No pudimos obtener tu ubicación. Escribe tu dirección.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (order.length === 0) return;
    if (!customer.name.trim()) {
      setFormError('Escribe tu nombre.');
      return;
    }
    if (delivery && !point && !address.trim()) {
      setFormError('Para delivery comparte tu ubicación o escribe tu dirección.');
      return;
    }
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) {
      setFormError('El correo no parece válido.');
      return;
    }
    setFormError(null);
    setSending(true);

    const info = {
      customer: { ...customer, name: customer.name.trim() },
      order, total, delivery, pickupLocation, point, address: address.trim(), deliveryEstimate,
    };
    const link = whatsappLink(buildWebOrderMessage(info));
    writeStorage(CUSTOMER_KEY, { name: info.customer.name, phone: customer.phone, email: customer.email });

    // Registro del pedido y correo de confirmación: si fallan, el pedido igual sigue por WhatsApp
    const tasks = [
      addDoc(collection(db, 'web_orders'), {
        customer: info.customer, items: order, total, delivery,
        pickupLocation: delivery ? null : pickupLocation,
        location: delivery ? point : null, address: info.address,
        deliveryEstimate: deliveryEstimate ? deliveryEstimate.cost : null,
        timestamp: new Date(),
      }),
    ];
    if (customer.email) {
      tasks.push(sendEmail({ to: customer.email, subject: `Tu pedido en ${SITE.name}`, body: buildWebOrderEmail(info) }));
    }
    const results = await Promise.allSettled(tasks);
    results.filter(r => r.status === 'rejected').forEach(r => console.error('Pedido web:', r.reason));

    setSending(false);
    setOrder([]);
    setSentLink(link);
    window.location.href = link;
  };

  // Pantalla final: por si el navegador no abrió WhatsApp automáticamente
  if (sentLink) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <FaCheckCircle className="mx-auto text-[#25D366]" size={64} />
        <h1 className="text-3xl font-extrabold text-ocean mt-4">¡Pedido listo!</h1>
        <p className="text-gray-600 mt-3">Te llevamos a WhatsApp con tu pedido escrito. Solo toca <b>Enviar</b> en el chat.</p>
        <a href={sentLink} className="mt-8 inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-7 py-3.5 rounded-full shadow-lg">
          <FaWhatsapp size={20} /> Abrir WhatsApp
        </a>
        {SITE.googleReviewUrl && (
          <div className="mt-10 bg-white rounded-3xl shadow-sm p-6">
            <div className="flex justify-center gap-1 text-yellow-400 mb-2">{[0, 1, 2, 3, 4].map(i => <FaStar key={i} />)}</div>
            <p className="font-bold text-ocean">¿Ya nos probaste?</p>
            <p className="text-sm text-gray-600 mt-1">Cuando disfrutes tu pedido, cuéntanos qué te pareció. Tu opinión en Google nos ayuda muchísimo.</p>
            <a href={SITE.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-semibold px-6 py-3 rounded-full transition">
              <FaStar className="text-yellow-300" /> Dejar mi reseña
            </a>
          </div>
        )}
        <div className="mt-6"><Link to="/" className="text-ocean font-semibold">Volver al inicio</Link></div>
      </div>
    );
  }

  const cartPanel = (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between border-b border-sand-dark">
        <h2 className="font-extrabold text-lg text-ocean flex items-center gap-2"><FaShoppingBag /> Tu pedido</h2>
        <button onClick={() => setCartOpen(false)} className="lg:hidden text-gray-500 p-1" aria-label="Cerrar"><FaTimes /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
        {order.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Aún no agregas nada.<br />Toca un tamaño para agregar.</p>
        ) : order.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 text-sm truncate">{item.cevicheName}</p>
              <p className="text-xs text-gray-500">{item.size !== '1' ? `${sizeLabel(item.size)} · ` : ''}{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleChangeQuantity(item.id, -1)} className="h-8 w-8 rounded-full bg-sand hover:bg-sand-dark flex items-center justify-center text-gray-600" aria-label="Menos">
                {item.quantity === 1 ? <FaTrash size={11} className="text-red-500" /> : <FaMinus size={10} />}
              </button>
              <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
              <button onClick={() => handleChangeQuantity(item.id, 1)} className="h-8 w-8 rounded-full bg-sand hover:bg-sand-dark flex items-center justify-center text-gray-600" aria-label="Más">
                <FaPlus size={10} />
              </button>
            </div>
            <span className="w-16 text-right font-bold text-ocean text-sm">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-sand-dark">
        <div className="flex justify-between items-end mb-3">
          <span className="text-gray-500">Total</span>
          <span className="text-2xl font-extrabold text-ocean">{formatPrice(total)}</span>
        </div>
        <button
          onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
          disabled={order.length === 0}
          className="w-full py-3.5 rounded-full font-bold text-white bg-coral hover:bg-coral-dark disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <PageHero eyebrow="Fácil y rápido" title="Ordena en línea" subtitle="Elige tus favoritos, dinos cómo lo quieres y envía el pedido por WhatsApp." />

      <div className="max-w-6xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 pb-32 lg:pb-12">
        {/* PRODUCTOS */}
        <div>
          <div className="sticky top-16 md:top-20 z-20 bg-sand/95 backdrop-blur py-3 -mx-4 px-4 space-y-3">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="search" placeholder="Buscar ceviche, cóctel o extra..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white shadow-sm outline-none focus:ring-2 focus:ring-coral/40" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {MENU_CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition shadow-sm ${category === c.key ? 'bg-coral text-white' : 'bg-white text-gray-700 hover:text-coral'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {menuLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 mt-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 rounded-3xl bg-sand-dark animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500 py-16">No encontramos productos con esa búsqueda.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {products.map(p => {
                const inCart = inCartById[p.id] || 0;
                return (
                  <div key={p.id} className={`bg-white rounded-3xl overflow-hidden shadow-sm flex transition ${inCart ? 'ring-2 ring-coral' : ''}`}>
                    <div className="relative w-28 sm:w-32 shrink-0 bg-sand-dark">
                      <img src={getMainImage(p.image)} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      {inCart > 0 && <span className="absolute top-2 left-2 h-7 min-w-7 px-2 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center shadow">{inCart}</span>}
                    </div>
                    <div className="p-4 flex-1 min-w-0">
                      <h3 className="font-bold text-ocean leading-tight">{p.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {Object.entries(p.prices).map(([size, price]) => (
                          <button key={size} onClick={() => handleAdd(p, size)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-coral-light text-coral-dark hover:bg-coral hover:text-white active:scale-95 transition">
                            {size === '1' ? 'Agregar' : sizeLabel(size)} · {formatPrice(price)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CARRITO (escritorio) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-3xl shadow-lg overflow-hidden max-h-[calc(100vh-7rem)]">{cartPanel}</div>
        </aside>
      </div>

      {/* BARRA INFERIOR (móvil) */}
      {itemCount > 0 && !cartOpen && !checkoutOpen && (
        <button onClick={() => setCartOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 right-20 z-40 bg-coral text-white rounded-full shadow-2xl px-5 py-4 flex items-center justify-between font-bold">
          <span className="flex items-center gap-2"><span className="bg-white/25 rounded-full h-7 min-w-7 px-2 flex items-center justify-center text-sm">{itemCount}</span> Ver pedido</span>
          <span className="flex items-center gap-2">{formatPrice(total)} <FaChevronUp /></span>
        </button>
      )}

      {/* CARRITO (móvil) */}
      {cartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col">{cartPanel}</div>
        </div>
      )}

      {/* AVISO AL AGREGAR */}
      {lastAdded && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-ocean text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2">
          <FaCheckCircle className="text-[#25D366]" /> {lastAdded} agregado
        </div>
      )}

      {/* DATOS DEL PEDIDO */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !sending && setCheckoutOpen(false)} />
          <form onSubmit={handleSubmit} className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-extrabold text-ocean">Casi listo</h2>
              <button type="button" onClick={() => setCheckoutOpen(false)} className="text-gray-500 p-1" aria-label="Cerrar"><FaTimes /></button>
            </div>

            {/* Entrega */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button type="button" onClick={() => setDelivery(false)}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold border-2 transition ${!delivery ? 'border-coral bg-coral-light text-coral-dark' : 'border-sand-dark text-gray-600'}`}>
                <FaStore /> Retiro
              </button>
              <button type="button" onClick={() => setDelivery(true)}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold border-2 transition ${delivery ? 'border-coral bg-coral-light text-coral-dark' : 'border-sand-dark text-gray-600'}`}>
                <FaMotorcycle /> Delivery
              </button>
            </div>

            {!delivery ? (
              <label className="block mb-4">
                <span className="text-sm font-semibold text-gray-700">¿En qué sucursal lo retiras?</span>
                <select value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} className="mt-1 w-full p-3 rounded-xl border border-sand-dark bg-white outline-none focus:border-coral">
                  {SITE.locations.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                </select>
              </label>
            ) : (
              <div className="mb-4 space-y-2">
                <button type="button" onClick={handleUseLocation} disabled={locating}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${point ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-ocean text-white hover:bg-ocean-dark'}`}>
                  {point ? <><FaCheckCircle /> Ubicación compartida</> : <><FaLocationArrow /> {locating ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}</>}
                </button>
                <input type="text" placeholder="Dirección o referencia (casa, edificio, punto de referencia)" value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-sand-dark outline-none focus:border-coral" />
                {deliveryEstimate && (
                  <p className="text-sm text-gray-600">Delivery aprox.: <b>{formatPrice(deliveryEstimate.cost)}</b> desde {deliveryEstimate.location.name}. Te lo confirmamos por WhatsApp.</p>
                )}
              </div>
            )}

            {/* Cliente */}
            <div className="space-y-3">
              <input type="text" required placeholder="Tu nombre *" autoComplete="name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-dark outline-none focus:border-coral" />
              <input type="tel" placeholder="Teléfono (opcional)" autoComplete="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-dark outline-none focus:border-coral" />
              <input type="email" placeholder="Correo para recibir confirmación (opcional)" autoComplete="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-dark outline-none focus:border-coral" />
              <textarea rows={2} placeholder="Notas: sin cebolla, más picante, hora de retiro..." value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-dark outline-none focus:border-coral resize-none" />
            </div>

            <div className="mt-5 bg-sand rounded-2xl p-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span><span className="font-bold">{formatPrice(total)}</span></div>
              {deliveryEstimate && <div className="flex justify-between mt-1"><span className="text-gray-600">Delivery aprox.</span><span>{formatPrice(deliveryEstimate.cost)}</span></div>}
            </div>

            {formError && <p className="text-red-600 text-sm mt-3">{formError}</p>}

            <button type="submit" disabled={sending}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] disabled:opacity-70 text-white font-bold py-4 rounded-full shadow-lg transition">
              <FaWhatsapp size={22} /> {sending ? 'Preparando pedido...' : 'Enviar pedido por WhatsApp'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">Se abrirá WhatsApp con tu pedido escrito. Solo toca enviar.</p>
          </form>
        </div>
      )}
    </>
  );
};

export default CevicheOrden;
