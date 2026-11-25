import { useState } from 'react';
import { getInventoryLabel, findMissingInventory } from './ventaHelpers';

// Aceptar nuevas props para el cierre de caja
const InventoryTextForm = ({
  inventoryDailyReport,
  setInventoryDailyReport,
  onSubmit,
  error,
  isClosingReport = false, // Nueva prop: true si es para cierre de caja
  dailyTotals = { efectivo: 0, yappy: 0, tarjeta: 0 }, // Totales de venta del día
  setClosingRegisterReport = () => {}, // Función para actualizar el campo de dinero
  submitting = false, // Evita doble envío mientras se guarda
  missingFields = [], // Campos que faltaban al intentar enviar (se marcan en rojo)
}) => {
  const [cash, setCash] = useState('');

  // Un campo se marca en rojo si faltaba al enviar y todavía no se ha llenado
  const stillMissing = new Set(findMissingInventory(inventoryDailyReport));
  const isMissing = (key) => missingFields.includes(key) && stillMissing.has(key);
  const cashMissing = missingFields.includes('dinero') && (cash === '' || isNaN(parseFloat(cash)) || parseFloat(cash) < 0);
  const pendingCount = stillMissing.size + (isClosingReport && (cash === '' || isNaN(parseFloat(cash))) ? 1 : 0);

  // Listado de claves que son ceviches/cócteles
  const cevicheKeys = [
    'cevicheTradicionalCorvina',
    'cevicheCamaron',
    'cevicheLangostino',
    'cevicheMixto',
    'cevicheConchaNegra',
    'coctelMixto',
    'coctelCamaron',
    'coctelCorvina',
    'coctelTropical',
    'cevichePulpo',
    'cevicheCombinacion',
    'coctelPersonalizado',
    'coctelHawaiCorvina',
    'coctelHawaiCamaronPulpo',
  ];

  // Generar array [0, 1, ..., 10] para el dropdown
  const quantityOptions = Array.from({ length: 11 }, (_, i) => i);

  const handleInputChange = (itemKey, e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setInventoryDailyReport(prev => ({
      ...prev,
      [itemKey]: value
    }));
  };

  // Manejador específico para los radio buttons (Nivel de llenado)
  const handleCevicheLevelChange = (cevicheKey, levelOption) => {
    setInventoryDailyReport(prev => {
      // Obtenemos el estado actual de este ceviche para no perder la cantidad recibida
      const currentCevicheState = prev[cevicheKey] || {};

      const updatedCeviche = {
        ...currentCevicheState, // Mantiene la propiedad receivedQuantity si ya existe
        galonLleno: false,
        galonMedio: false,
        galonMedioLleno: false, 
        galonUnCuarto: false,
        noHay: false,
        [levelOption]: true, // Marcar solo la opción seleccionada
      };
      
      return {
        ...prev,
        [cevicheKey]: updatedCeviche,
      };
    });
  };

  // NUEVO: Manejador para la cantidad de galones recibidos
  const handleNewGallonsChange = (cevicheKey, quantity) => {
    setInventoryDailyReport(prev => ({
        ...prev,
        [cevicheKey]: {
            ...prev[cevicheKey], // Mantiene los booleanos de los radio buttons
            receivedQuantity: parseInt(quantity) // Agrega/Actualiza la cantidad recibida
        }
    }));
  };

  // Manejador para el campo de dinero en el cierre de caja
  const handleMoneyInputChange = (e) => {
    const value = e.target.value;
    setCash(value);
    setClosingRegisterReport(prev => ({ ...prev, dinero: value }));
  };

  const getItemDisplayName = getInventoryLabel;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">
          {isClosingReport ? 'Reporte de Cierre de Caja' : 'Reporte de Inventario Diario'}
        </h2>
        <p className="mb-4 text-gray-700">
          {isClosingReport
            ? 'Por favor, ingresa el dinero en efectivo y confirma el inventario final.'
            : 'Por favor, ingresa las cantidades o marca el nivel de inventario para abrir el día.'}
        </p>

        {/* Sección Totales (Solo Cierre) */}
        {isClosingReport && (
          <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Totales del Día (Sistema):</h3>
            <p className="text-blue-700 font-semibold">Efectivo: <span className="font-bold text-lg">${dailyTotals.efectivo.toFixed(2)}</span></p>
            <p className="text-blue-700 font-semibold">Yappy: <span className="font-bold text-lg">${dailyTotals.yappy.toFixed(2)}</span></p>
            <p className="text-blue-700 font-semibold">Tarjeta: <span className="font-bold text-lg">${dailyTotals.tarjeta.toFixed(2)}</span></p>
            <div id="field-dinero" className="mt-4">
              <label htmlFor="dinero" className="block text-lg font-semibold mb-2 text-gray-800">
                Dinero en Caja (físico): <span className="text-red-600">*</span>
              </label>
              <input
                id="dinero"
                type="number"
                inputMode="decimal"
                placeholder="Ingresa el efectivo"
                value={cash}
                onChange={handleMoneyInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-green-500 focus:border-green-500 text-lg font-bold ${cashMissing ? 'border-2 border-red-500 bg-red-50' : ''}`}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {isClosingReport ? 'Inventario Final:' : 'Inventario Inicial:'}
        </h3>

        {/* Iteración de items */}
        {Object.keys(inventoryDailyReport).map((itemKey) => (
          <div
            key={itemKey}
            id={`field-${itemKey}`}
            className={`mb-4 p-3 rounded-lg bg-red-50 ${isMissing(itemKey) ? 'border-2 border-red-500 ring-2 ring-red-200' : 'border'}`}
          >
            <label htmlFor={itemKey} className="block text-lg font-semibold mb-2 text-gray-800">
              {getItemDisplayName(itemKey)}:
              {typeof inventoryDailyReport[itemKey] !== 'boolean' && <span className="text-red-600"> *</span>}
            </label>
            {isMissing(itemKey) && (
              <p className="text-red-600 text-sm font-bold mb-2">
                {typeof inventoryDailyReport[itemKey] === 'object' ? '⚠️ Marca el nivel del galón' : '⚠️ Escribe la cantidad (pon 0 si no hay)'}
              </p>
            )}
            
            {cevicheKeys.includes(itemKey) ? (
              <div className="flex flex-col gap-3">
                 {/* 1. RADIO BUTTONS (NIVEL ACTUAL) */}
                 <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <label className="inline-flex items-center">
                      <input type="radio" name={`ceviche-${itemKey}`} value="galonLleno" checked={inventoryDailyReport[itemKey].galonLleno} onChange={() => handleCevicheLevelChange(itemKey, 'galonLleno')} className="form-radio h-4 w-4 text-orange-600" />
                      <span className="ml-2 text-gray-700 text-sm">Lleno (4/4)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name={`ceviche-${itemKey}`} value="galonMedioLleno" checked={inventoryDailyReport[itemKey].galonMedioLleno} onChange={() => handleCevicheLevelChange(itemKey, 'galonMedioLleno')} className="form-radio h-4 w-4 text-orange-600" />
                      <span className="ml-2 text-gray-700 text-sm">Casi Lleno (3/4)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name={`ceviche-${itemKey}`} value="galonMedio" checked={inventoryDailyReport[itemKey].galonMedio} onChange={() => handleCevicheLevelChange(itemKey, 'galonMedio')} className="form-radio h-4 w-4 text-orange-600" />
                      <span className="ml-2 text-gray-700 text-sm">Medio (2/4)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name={`ceviche-${itemKey}`} value="galonUnCuarto" checked={inventoryDailyReport[itemKey].galonUnCuarto} onChange={() => handleCevicheLevelChange(itemKey, 'galonUnCuarto')} className="form-radio h-4 w-4 text-orange-600" />
                      <span className="ml-2 text-gray-700 text-sm">Un Cuarto (1/4)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name={`ceviche-${itemKey}`} value="noHay" checked={inventoryDailyReport[itemKey].noHay} onChange={() => handleCevicheLevelChange(itemKey, 'noHay')} className="form-radio h-4 w-4 text-red-600" />
                      <span className="ml-2 text-gray-700 text-sm font-bold">VACÍO</span>
                    </label>
                 </div>

                 {/* 2. LISTVIEW (DROPDOWN) PARA NUEVOS GALONES */}
                 <div className="pt-2 border-t border-red-200 mt-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        📦 ¿Cuántos galones te dieron?
                    </label>
                    <select 
                        value={inventoryDailyReport[itemKey]?.receivedQuantity || 0} 
                        onChange={(e) => handleNewGallonsChange(itemKey, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:border-orange-500 outline-none"
                    >
                        {quantityOptions.map((num) => (
                            <option key={num} value={num}>
                                {num} {num === 1 ? 'galón' : 'galones'}
                            </option>
                        ))}
                    </select>
                 </div>
              </div>

            ) : ['uvas', 'kiwi', 'coco', 'pina', 'nachosSinPreparar', 'cucharas', 'bolsitas5x10','vuelto'].includes(itemKey) ? (
              // Checkboxes simples
              <div className="flex items-center">
                <input
                  id={itemKey}
                  type="checkbox"
                  checked={inventoryDailyReport[itemKey]}
                  onChange={(e) => handleInputChange(itemKey, e)}
                  className="form-checkbox h-5 w-5 text-orange-600 rounded mr-2"
                />
                <span className="text-gray-700 font-normal text-sm">Selecciona esta casilla si no tienes de este producto</span>
              </div>
            ) : (
              // Inputs numéricos para insumos
              <input
                id={itemKey}
                type="number"
                inputMode="numeric"
                placeholder="Cantidad (0 si no hay)"
                value={inventoryDailyReport[itemKey]}
                onChange={(e) => handleInputChange(itemKey, e)}
                className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                min="0"
              />
            )}
          </div>
        ))}

        {error && <p className="text-red-600 font-semibold text-center mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">{error}</p>}
        {!error && pendingCount > 0 && (
          <p className="text-gray-500 text-sm text-center">Faltan {pendingCount} {pendingCount === 1 ? 'campo' : 'campos'} por llenar.</p>
        )}

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="bg-orange-600 text-white px-6 py-4 rounded-xl w-full text-lg font-semibold hover:bg-orange-700 disabled:opacity-60 transition-colors duration-200 mt-4"
        >
          {submitting ? 'Enviando...' : isClosingReport ? 'Enviar Cierre de Caja' : 'Enviar Reporte y Abrir Día'}
        </button>
      </div>
    </div>
  );
};

export default InventoryTextForm;