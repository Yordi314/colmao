import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function ProductModal({ isOpen, onClose, producto, categorias, onSuccess }: any) {
  const isEditing = !!producto;

  const [formData, setFormData] = useState({
    nombre: '',
    categoriaId: '',
    precio: '',
    costo: '',
    stock: '',
    stockMinimo: '',
    unidad: 'ud',
    permiteDetalle: false,
    esFrecuente: false,
    emoji: '📦'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          nombre: producto.nombre,
          categoriaId: producto.categoriaId.toString(),
          precio: producto.precio.toString(),
          costo: producto.costo ? producto.costo.toString() : '',
          stock: producto.stock.toString(),
          stockMinimo: producto.stockMinimo.toString(),
          unidad: producto.unidad,
          permiteDetalle: producto.permiteDetalle,
          esFrecuente: producto.esFrecuente,
          emoji: producto.emoji || '📦'
        });
      } else {
        setFormData({
          nombre: '',
          categoriaId: categorias.length > 0 ? categorias[0].id.toString() : '',
          precio: '',
          costo: '',
          stock: '0',
          stockMinimo: '5',
          unidad: 'ud',
          permiteDetalle: false,
          esFrecuente: false,
          emoji: '📦'
        });
      }
    }
  }, [isOpen, producto, categorias]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/inventario/productos/${producto.id}`, formData);
        toast.success('Producto actualizado');
      } else {
        await api.post('/inventario/productos', formData);
        toast.success('Producto creado');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface rounded-xl shadow-elevated w-full max-w-2xl my-8">
        
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-2 text-muted hover:text-ink hover:bg-border/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Nombre y Emoji */}
            <div className="md:col-span-2 flex gap-3">
              <div className="w-20">
                <label className="block text-sm font-bold text-ink mb-1">Emoji</label>
                <input
                  type="text"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-center text-2xl focus:border-primary outline-none"
                  maxLength={2}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-ink mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary outline-none"
                  required
                />
              </div>
            </div>

            {/* Categoría */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-ink mb-1">Categoría *</label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary outline-none"
                required
              >
                {categorias.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Precios */}
            <div>
              <label className="block text-sm font-bold text-ink mb-1">Precio Venta (RD$) *</label>
              <input
                type="number"
                name="precio"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-1">Costo (RD$)</label>
              <input
                type="number"
                name="costo"
                step="0.01"
                min="0"
                value={formData.costo}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary outline-none"
              />
            </div>

            {/* Stock Inicial (sólo creación) y Mínimo */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-bold text-ink mb-1">Stock Inicial *</label>
                <input
                  type="number"
                  name="stock"
                  step="0.01"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary outline-none"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-ink mb-1">Stock Mínimo (Alerta) *</label>
              <input
                type="number"
                name="stockMinimo"
                step="0.01"
                value={formData.stockMinimo}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary outline-none"
                required
              />
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-sm font-bold text-ink mb-1">Unidad *</label>
              <select
                name="unidad"
                value={formData.unidad}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-xl p-3 text-ink focus:border-primary outline-none"
                required
              >
                <option value="ud">Unidad (ud)</option>
                <option value="lb">Libra (lb)</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="gal">Galón (gal)</option>
              </select>
            </div>
            
            {/* Switches */}
            <div className="flex flex-col gap-3 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="permiteDetalle"
                  checked={formData.permiteDetalle}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm font-bold text-ink">Permite Detalle (fracciones)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="esFrecuente"
                  checked={formData.esFrecuente}
                  onChange={handleChange}
                  className="w-5 h-5 text-accent border-border rounded focus:ring-accent"
                />
                <span className="text-sm font-bold text-ink">Producto Estrella (⭐ Frecuente)</span>
              </label>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-ink hover:bg-surface-2 transition-colors border border-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
