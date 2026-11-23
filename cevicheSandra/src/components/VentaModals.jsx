import { FaBoxOpen } from 'react-icons/fa';
import { CONTAINERS } from './ventasUtils';
import { money } from './ventaHelpers';

const Modal = ({ children }) => (
  <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">{children}</div>
  </div>
);

const ModalActions = ({ onCancel, onConfirm, confirmLabel, confirmClass }) => (
  <div className="grid grid-cols-2 gap-3">
    <button onClick={onCancel} className="py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Cancelar</button>
    <button onClick={onConfirm} className={`py-2 rounded-lg font-bold text-white ${confirmClass}`}>{confirmLabel}</button>
  </div>
);

// Aviso antes de abrir el cierre de caja (una sola vez al día)
export const ClosingConfirmModal = ({ onCancel, onConfirm }) => (
  <Modal>
    <h3 className="text-lg font-bold text-red-600 mb-2">⚠️ Cierre de Caja</h3>
    <p className="text-sm text-gray-600 mb-2">
      El cierre de caja <b>solo se puede hacer una vez al día</b>.
    </p>
    <p className="text-sm text-gray-600 mb-4">
      Al abrirlo verás los totales del día y ya no podrás seguir vendiendo hasta enviarlo, aunque recargues la página. Ten el dinero contado antes de continuar.
    </p>
    <ModalActions onCancel={onCancel} onConfirm={onConfirm} confirmLabel="Abrir cierre" confirmClass="bg-red-500 hover:bg-red-600" />
  </Modal>
);

// Aviso de posible pedido repetido
export const DuplicateOrderModal = ({ duplicate, onCancel, onConfirm }) => (
  <Modal>
    <h3 className="text-lg font-bold text-yellow-700 mb-2">⚠️ Posible pedido repetido</h3>
    <p className="text-sm text-gray-600 mb-3">
      Ya se envió un pedido igual ({money(parseFloat(duplicate.total) || 0)}, {duplicate.paymentMethod || 'Efectivo'}) a las{' '}
      {duplicate.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
      ¿Es un pedido nuevo?
    </p>
    <ul className="text-xs text-gray-500 mb-4 space-y-1">
      {(duplicate.items || []).map((item, i) => (
        <li key={i}>• {item.quantity}x {item.cevicheName} ({item.size})</li>
      ))}
    </ul>
    <ModalActions onCancel={onCancel} onConfirm={onConfirm} confirmLabel="Enviar igual" confirmClass="bg-yellow-500 hover:bg-yellow-600" />
  </Modal>
);

// Registro de envases recibidos durante el día
export const ReceiptModal = ({ form, setForm, receivedToday, error, onCancel, onSave }) => (
  <Modal>
    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><FaBoxOpen /> Envases recibidos</h3>
    <p className="text-sm text-gray-500 mb-4">Anota los envases que te llevaron durante el día. Se suman al cuadre del cierre.</p>
    <div className="space-y-3 mb-4">
      {CONTAINERS.map(c => (
        <div key={c.key} className="flex items-center gap-3">
          <label htmlFor={`rec-${c.key}`} className="w-16 font-semibold text-gray-700">{c.label}</label>
          <input
            id={`rec-${c.key}`}
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="0"
            value={form[c.key]}
            onChange={e => setForm(prev => ({ ...prev, [c.key]: e.target.value }))}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none"
          />
          <span className="text-xs text-gray-400 w-20 text-right">Hoy: {receivedToday[c.key] || 0}</span>
        </div>
      ))}
    </div>
    {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
    <ModalActions onCancel={onCancel} onConfirm={onSave} confirmLabel="Guardar" confirmClass="bg-orange-500 hover:bg-orange-600" />
  </Modal>
);
