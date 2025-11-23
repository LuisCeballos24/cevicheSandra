import React from 'react';

// Aceptar nuevas props para el cierre de caja
const InventoryTextForm = ({
  inventoryDailyReport,
  setInventoryDailyReport,
  onSubmit,
  error,
  isClosingReport = false, // Nueva prop: true si es para cierre de caja
  dailyTotals = { efectivo: 0, yappy: 0 }, // Totales de venta del día
  closingRegisterReport = { dinero: '' }, // Estado para el campo de dinero en caja
  setClosingRegisterReport = () => {}, // Función para actualizar el campo de dinero
}) => {

  // Listado de claves que son ceviches/cócteles y necesitan las opciones de llenado
  const cevicheKeys = [
    'cevicheTradicionalCorvina',
    'cevicheCamaron',
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

  const handleInputChange = (itemKey, e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setInventoryDailyReport(prev => ({
      ...prev,
      [itemKey]: value
    }));
  };

  // Manejador específico para los radio buttons de ceviche
  const handleCevicheLevelChange = (cevicheKey, levelOption) => {
    setInventoryDailyReport(prev => {
      const updatedCeviche = {
        galonLleno: false,
        galonMedio: false,
        galonMedioLleno: false, // Mantienes esta opción
        galonUnCuarto: false,
        noHay: false,
        [levelOption]: true, // Marcar solo la opción seleccionada como true
      };
      return {
        ...prev,
        [cevicheKey]: updatedCeviche,
      };
    });
  };

  // Nuevo manejador para el campo de dinero en el cierre de caja
  const handleMoneyInputChange = (e) => {
    const value = e.target.value;
    setClosingRegisterReport(prev => ({ ...prev, dinero: value }));
  };

  // Función para obtener el nombre legible del campo
  const getItemDisplayName = (itemKey) => {
    switch (itemKey) {
      case 'nachosGrande': return 'Nachos Grandes';
      case 'nachosPequeno': return 'Nachos Pequeños';
      case 'vasos7oz': return 'Vasos 7oz';
      case 'cucharas': return 'Cucharas';
      case 'bolsitas5x10': return 'Bolsitas 5x10';
      case 'envases16oz': return 'Envases 16oz';
      case 'envases24oz': return 'Envases 24oz';
      case 'uvas': return 'Uvas';
      case 'kiwi': return 'Kiwi';
      case 'coco': return 'Coco';
      case 'pina': return 'Piña';
      case 'vuelto': return 'Te dieron Vuelto?';
      case 'nachosSinPreparar': return 'Nachos sin preparar';
      // Nombres para los ceviches
      case 'cevicheTradicionalCorvina': return 'Ceviche Tradicional Corvina';
      case 'cevicheCamaron': return 'Ceviche Camarón';
      case 'cevicheMixto': return 'Ceviche Mixto';
      case 'cevicheConchaNegra': return 'Ceviche Concha Negra';
      case 'coctelMixto': return 'Cóctel Mixto';
      case 'coctelCamaron': return 'Cóctel Camarón';
      case 'coctelCorvina': return 'Cóctel Corvina';
      case 'coctelTropical': return 'Cóctel Tropical';
      case 'cevichePulpo': return 'Ceviche Pulpo';
      case 'cevicheCombinacion': return 'Ceviche Combinación';
      case 'coctelPersonalizado': return 'Cóctel PERSONALIZADO';
      case 'coctelHawaiCorvina': return 'Cóctel Hawai Corvina';
      case 'coctelHawaiCamaronPulpo': return 'Cóctel Hawai Camarón/Pulpo';
      default: return itemKey;
    }
  };

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

        {/* Sección para el cierre de caja: Totales del día y campo de dinero */}
        {isClosingReport && (
          <div className="mb-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Totales del Día (Sistema):</h3>
            <p className="text-blue-700 font-semibold">Efectivo: <span className="font-bold text-lg">${dailyTotals.efectivo.toFixed(2)}</span></p>
            <div className="mt-4">
              <label htmlFor="dinero" className="block text-lg font-semibold mb-2 text-gray-800">
                Dinero en Caja (físico):
              </label>
              <input
                id="dinero"
                type="number"
                placeholder="Ingresa el efectivo"
                onChange={handleMoneyInputChange} // Usa el nuevo manejador
                className="w-full p-2 border rounded-lg focus:ring-green-500 focus:border-green-500 text-lg font-bold"
                min="0"
                step="0.01" // Permite valores decimales
              />
            </div>
          </div>
        )}

        {/* Título para el inventario, cambia según sea cierre o apertura */}
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {isClosingReport ? 'Inventario Final:' : 'Inventario Inicial:'}
        </h3>

        {/* Iteración sobre los ítems del inventario */}
        {Object.keys(inventoryDailyReport).map((itemKey) => (
          <div key={itemKey} className="mb-4 p-3 border rounded-lg bg-red-50">
            <label htmlFor={itemKey} className="block text-lg font-semibold mb-2 text-gray-800">
              {getItemDisplayName(itemKey)}:
            </label>
            {/* Renderizado condicional del input */}
            {cevicheKeys.includes(itemKey) ? (
              // Opciones para ceviches (radio buttons)
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`ceviche-${itemKey}`} // Agrupa los radios por nombre
                    value="galonLleno"
                    checked={inventoryDailyReport[itemKey].galonLleno}
                    onChange={() => handleCevicheLevelChange(itemKey, 'galonLleno')}
                    className="form-radio h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-gray-700">Galón Lleno 4/4</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`ceviche-${itemKey}`}
                    value="galonMedioLleno"
                    checked={inventoryDailyReport[itemKey].galonMedioLleno}
                    onChange={() => handleCevicheLevelChange(itemKey, 'galonMedioLleno')}
                    className="form-radio h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-gray-700">Medio Galón Casi lleno 3/4</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`ceviche-${itemKey}`}
                    value="galonMedio"
                    checked={inventoryDailyReport[itemKey].galonMedio}
                    onChange={() => handleCevicheLevelChange(itemKey, 'galonMedio')}
                    className="form-radio h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-gray-700">Medio Galón 2/4</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`ceviche-${itemKey}`}
                    value="galonUnCuarto"
                    checked={inventoryDailyReport[itemKey].galonUnCuarto}
                    onChange={() => handleCevicheLevelChange(itemKey, 'galonUnCuarto')}
                    className="form-radio h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-gray-700">Un Cuarto de Galón 1/4</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`ceviche-${itemKey}`}
                    value="noHay"
                    checked={inventoryDailyReport[itemKey].noHay}
                    onChange={() => handleCevicheLevelChange(itemKey, 'noHay')}
                    className="form-radio h-4 w-4 text-red-600"
                  />
                  <span className="ml-2 text-gray-700">No hay</span>
                </label>
              </div>
            ) : ['uvas', 'kiwi', 'coco', 'pina', 'nachosSinPreparar', 'cucharas', 'bolsitas5x10','vuelto'].includes(itemKey) ? (
              // Checkboxes para frutas, nachos sin preparar, cucharas, bolsitas5x10
              <div className="flex items-center">
                <input
                  id={itemKey}
                  type="checkbox"
                  checked={inventoryDailyReport[itemKey]}
                  onChange={(e) => handleInputChange(itemKey, e)}
                  className="form-checkbox h-5 w-5 text-orange-600 rounded mr-2"
                  // Opcional: deshabilitar en el cierre si no se permite modificar
                  // disabled={isClosingReport}
                />
                <span className="text-gray-700 font-normal text-sm">Selecciona esta casilla si no tienes de este producto</span> {/* Este mensaje es el que tenías, lo mantengo */}
              </div>
            ) : (
              // Inputs numéricos para otros ítems
              <input
                id={itemKey}
                type="number"
                placeholder="Cantidad"
                value={inventoryDailyReport[itemKey]}
                onChange={(e) => handleInputChange(itemKey, e)}
                className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                min="0"
                // Opcional: deshabilitar en el cierre si no se permite modificar
                // disabled={isClosingReport}
              />
            )}
          </div>
        ))}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          onClick={onSubmit}
          className="bg-orange-600 text-white px-6 py-3 rounded-xl w-full text-lg font-semibold hover:bg-orange-700 transition-colors duration-200 mt-4"
        >
          {isClosingReport ? 'Enviar Cierre de Caja' : 'Enviar Reporte y Abrir Día'}
        </button>
      </div>
    </div>
  );
};

export default InventoryTextForm;