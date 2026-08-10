import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, UserCheck, DollarSign } from 'lucide-react';
import api from '../../lib/api';

interface CobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onSuccess: () => void;
}

export default function CobroModal({ isOpen, onClose, total, onSuccess }: CobroModalProps) {
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'fiado'>('efectivo');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && tipoPago === 'fiado' && clientes.length === 0) {
      cargarClientes();
    }
  }, [isOpen, tipoPago]);

  // Limpiar estados cuando se cierra o abre
  useEffect(() => {
    if (isOpen) {
      setTipoPago('efectivo');
      setMontoRecibido('');
      setClienteId(null);
      setError('');
    }
  }, [isOpen]);

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data.data);
    } catch (err) {
      setError('Error al cargar clientes');
    }
  };

  if (!isOpen) return null;

  const totalRedondeado = Math.round(total);
  const montoNum = Math.round(parseFloat(montoRecibido) || 0);
  const cambio = montoNum - totalRedondeado;
  
  const clienteSeleccionado = clientes.find(c => c.id === clienteId);
  const limiteExcedido = tipoPago === 'fiado' && clienteSeleccionado && (clienteSeleccionado.saldo + totalRedondeado > Number(clienteSeleccionado.limiteCredito));
  
  const puedeCobrarEfectivo = tipoPago === 'efectivo' && montoNum >= totalRedondeado;
  const puedeCobrarFiado = tipoPago === 'fiado' && clienteId !== null && !limiteExcedido;
  const puedeCobrar = puedeCobrarEfectivo || puedeCobrarFiado;

  const handleCobrar = async () => {
    if (!puedeCobrar) return;
    setLoading(true);
    setError('');

    const payload = {
      tipo_pago: tipoPago,
      monto_recibido: tipoPago === 'efectivo' ? montoNum : null,
      cliente_id: tipoPago === 'fiado' ? clienteId : null,
      // Los items los pasa el componente padre a través de onSuccess o el contexto,
      // pero para mantenerlo simple, este modal debería recibir la acción completa de cobro.
    };

    try {
      await onSuccess(payload);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al procesar el cobro');
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-xl shadow-elevated w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50">
          <h2 className="text-lg font-bold text-ink">Cobrar Venta</h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-ink hover:bg-border/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-muted mb-1">Total a Pagar</p>
            <p className="text-4xl font-bold text-primary">RD${totalRedondeado}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setTipoPago('efectivo')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                tipoPago === 'efectivo' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border text-muted hover:border-primary/30 hover:bg-surface-2'
              }`}
            >
              <DollarSign className="w-6 h-6" />
              <span className="font-bold">Efectivo</span>
            </button>
            <button
              onClick={() => setTipoPago('fiado')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                tipoPago === 'fiado' 
                  ? 'border-accent bg-accent/5 text-accent' 
                  : 'border-border text-muted hover:border-accent/30 hover:bg-surface-2'
              }`}
            >
              <UserCheck className="w-6 h-6" />
              <span className="font-bold">Fiado</span>
            </button>
          </div>

          {tipoPago === 'efectivo' ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Monto Recibido</label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg font-bold">RD$</span>
                  <input
                    type="number"
                    min={totalRedondeado}
                    step="1"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-lg font-bold text-ink focus:border-primary outline-none transition-colors"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                
                {/* Billetes Rápidos */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button onClick={() => setMontoRecibido(totalRedondeado.toString())} className="px-3 py-1.5 bg-surface-2 hover:bg-primary/10 hover:text-primary text-muted font-bold rounded-lg border border-border transition-colors text-sm">Exacto</button>
                  <button onClick={() => setMontoRecibido('50')} className="px-3 py-1.5 bg-surface-2 hover:bg-primary/10 hover:text-primary text-muted font-bold rounded-lg border border-border transition-colors text-sm">$50</button>
                  <button onClick={() => setMontoRecibido('100')} className="px-3 py-1.5 bg-surface-2 hover:bg-primary/10 hover:text-primary text-muted font-bold rounded-lg border border-border transition-colors text-sm">$100</button>
                  <button onClick={() => setMontoRecibido('200')} className="px-3 py-1.5 bg-surface-2 hover:bg-primary/10 hover:text-primary text-muted font-bold rounded-lg border border-border transition-colors text-sm">$200</button>
                  <button onClick={() => setMontoRecibido('500')} className="px-3 py-1.5 bg-surface-2 hover:bg-primary/10 hover:text-primary text-muted font-bold rounded-lg border border-border transition-colors text-sm">$500</button>
                  <button onClick={() => setMontoRecibido('1000')} className="px-3 py-1.5 bg-surface-2 hover:bg-primary/10 hover:text-primary text-muted font-bold rounded-lg border border-border transition-colors text-sm">$1000</button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                <span className="font-medium text-muted">Cambio a devolver</span>
                <span className={`text-2xl font-bold ${cambio >= 0 ? 'text-success' : 'text-error'}`}>
                  RD${cambio >= 0 ? cambio : '0'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Seleccionar Cliente</label>
                <select
                  value={clienteId || ''}
                  onChange={(e) => setClienteId(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-accent outline-none transition-colors font-medium"
                >
                  <option value="" disabled>-- Seleccione un cliente --</option>
                  {clientes.filter(c => c.activo).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (Saldo: RD${Math.round(Number(c.saldo))} / RD${Math.round(Number(c.limiteCredito))})
                    </option>
                  ))}
                </select>
              </div>
              
              {limiteExcedido ? (
                <p className="text-sm text-error bg-error/10 p-3 rounded-lg font-bold">
                  El cliente excedería su límite de crédito de RD${Math.round(Number(clienteSeleccionado?.limiteCredito || 0))}.
                </p>
              ) : (
                <p className="text-sm text-muted bg-accent/5 p-3 rounded-lg flex gap-2">
                  <CreditCard className="w-4 h-4 shrink-0 text-accent" />
                  Esta venta se sumará al saldo pendiente del cliente.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-error/10 text-error rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-surface-2/50">
          <button
            onClick={handleCobrar}
            disabled={!puedeCobrar || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${
              loading ? 'opacity-70 cursor-not-allowed bg-muted' :
              !puedeCobrar ? 'bg-muted cursor-not-allowed' :
              tipoPago === 'efectivo' ? 'bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20' : 'bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20'
            }`}
          >
            {loading ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
