import { useState } from 'react';
import { X, PackagePlus, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function AdjustStockModal({ isOpen, onClose, producto, onSuccess }: any) {
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('Ajuste manual');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(cantidad);
    if (!val || val === 0) {
      toast.error('La cantidad no puede ser 0');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/inventario/productos/${producto.id}/stock`, {
        cantidad: val,
        motivo
      });
      toast.success('Stock ajustado exitosamente');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error al ajustar stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-elevated w-full max-w-md overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-primary" />
            Ajustar Stock
          </h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-ink hover:bg-border/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-surface-2 border border-border rounded-xl p-4 mb-2 flex items-center gap-4">
            <div className="text-4xl">{producto.emoji}</div>
            <div>
              <p className="font-bold text-ink">{producto.nombre}</p>
              <p className="text-sm text-muted">Stock Actual: <strong className="text-ink">{producto.stock} {producto.unidad}</strong></p>
            </div>
          </div>

          <div className="bg-warning/10 text-warning-700 p-3 rounded-lg text-sm flex gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Usa valores positivos para sumar stock (ej. 10) y valores negativos para restar (ej. -5).
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-1">Cantidad a ajustar *</label>
            <input
              type="number"
              step={producto.permiteDetalle ? "0.01" : "1"}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium font-mono text-lg"
              placeholder="Ej. 10 o -5"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-1">Motivo</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
              placeholder="Ej. Compra, Merma..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !cantidad || parseFloat(cantidad) === 0}
            className="w-full py-4 mt-2 rounded-xl font-bold text-lg text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Confirmar Ajuste'}
          </button>
        </form>

      </div>
    </div>
  );
}
