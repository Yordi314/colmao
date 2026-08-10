import { useState, useEffect } from 'react';
import { X, UserPlus, CreditCard, Clock, Phone } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function NuevoClienteModal({ isOpen, onClose, onSuccess }: any) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [limiteCredito, setLimiteCredito] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setTelefono('');
      setLimiteCredito('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;
    setLoading(true);
    try {
      await api.post('/clientes', {
        nombre,
        telefono,
        limiteCredito: Number(limiteCredito) || 0
      });
      toast.success('Cliente creado exitosamente');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-elevated w-full max-w-md overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent" />
            Nuevo Cliente
          </h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-ink hover:bg-border/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1">Nombre Completo *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium"
              placeholder="Ej. Juan Pérez"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-3 py-3 text-ink focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium"
                placeholder="809-000-0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1">Límite de Crédito (RD$)</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="number"
                min="0"
                step="100"
                value={limiteCredito}
                onChange={(e) => setLimiteCredito(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-3 py-3 text-ink focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !nombre}
            className="w-full py-4 mt-2 rounded-xl font-bold text-lg text-white bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Cliente'}
          </button>
        </form>

      </div>
    </div>
  );
}
