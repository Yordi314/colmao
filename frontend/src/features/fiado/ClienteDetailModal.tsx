import { useState, useEffect } from 'react';
import { X, DollarSign, History, Calendar, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function ClienteDetailModal({ isOpen, onClose, onSuccess, clienteId }: any) {
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [montoAbono, setMontoAbono] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen && clienteId) {
      cargarDetalle();
      setMontoAbono('');
    }
  }, [isOpen, clienteId]);

  const cargarDetalle = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/clientes/${clienteId}`);
      setCliente(res.data.data);
    } catch (error) {
      toast.error('Error al cargar detalle del cliente');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAbonar = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(montoAbono);
    if (!monto || monto <= 0) return;
    
    setProcesando(true);
    try {
      await api.post(`/clientes/${clienteId}/abonos`, { monto });
      toast.success(`Abono de RD$${monto.toFixed(2)} registrado exitosamente`);
      setMontoAbono('');
      cargarDetalle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error al registrar abono');
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminarClick = () => {
    setIsConfirmOpen(true);
  };

  const handleEliminarConfirm = async () => {
    setIsConfirmOpen(false);
    try {
      setLoading(true);
      const res = await api.delete(`/clientes/${clienteId}`);
      toast.success(res.data.message, { duration: 5000 });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error al eliminar cliente');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-elevated w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {loading ? (
          <div className="p-12 flex justify-center text-accent animate-pulse">Cargando...</div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-ink">{cliente?.nombre}</h2>
                {!cliente?.activo && <span className="bg-error/10 text-error px-2 py-0.5 rounded-full text-xs uppercase tracking-wider font-bold">Inactivo</span>}
              </div>
              <div className="flex items-center gap-2">
                {cliente?.activo && (
                  <button 
                    onClick={handleEliminarClick} 
                    className="p-2 text-error hover:bg-error/10 rounded-full transition-colors flex items-center justify-center"
                    title="Eliminar o desactivar cliente"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 text-muted hover:text-ink hover:bg-border/50 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Tarjeta de Saldo */}
              <div className="bg-surface-2 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-border mb-6">
                <div>
                  <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">Saldo Pendiente</p>
                  <p className={`text-4xl font-extrabold ${cliente?.saldo > 0 ? 'text-error' : 'text-success'}`}>
                    RD${cliente?.saldo.toFixed(2)}
                  </p>
                </div>
                
                {cliente?.saldo > 0 && (
                  <form onSubmit={handleAbonar} className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">RD$</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={montoAbono}
                        onChange={(e) => setMontoAbono(e.target.value)}
                        className="w-full bg-surface border-2 border-border rounded-xl pl-12 pr-3 py-3 font-bold text-ink focus:border-accent outline-none"
                        placeholder="Monto"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={procesando || !montoAbono}
                      className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
                    >
                      {procesando ? '...' : 'Abonar'}
                    </button>
                  </form>
                )}
              </div>

              {/* Historial */}
              <div>
                <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-muted" />
                  Últimos Movimientos
                </h3>
                
                <div className="space-y-3">
                  {(!cliente?.movimientos || cliente.movimientos.length === 0) ? (
                    <div className="text-center p-8 text-muted bg-surface-2 rounded-xl">
                      No hay movimientos registrados
                    </div>
                  ) : (
                    cliente.movimientos.map((mov: any, idx: number) => {
                      const isAbono = mov.tipo === 'abono';
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isAbono ? 'bg-success/10 text-success' : 'bg-[#FF7F50]/10 text-[#FF7F50]'}`}>
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-ink capitalize">{mov.tipo}</p>
                              <p className="text-sm text-muted flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(mov.fecha).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className={`font-bold text-lg ${isAbono ? 'text-success' : 'text-[#FF7F50]'}`}>
                            {isAbono ? '−' : '＋'}RD${mov.monto.toFixed(2)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
      
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="¿Eliminar cliente?"
        message="¿Seguro que deseas eliminar a este cliente? Si tiene historial de ventas o abonos, será desactivado (oculto en nuevas ventas) en lugar de borrado para no romper los registros."
        confirmText="Eliminar"
        onConfirm={handleEliminarConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
