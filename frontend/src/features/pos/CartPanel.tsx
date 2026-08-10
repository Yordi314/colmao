import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import CobroModal from './CobroModal';
import api from '../../lib/api';
import { toast } from 'sonner';

interface Props {
  onClose?: () => void;
}

export default function CartPanel({ onClose }: Props) {
  const { items, subtotal, itbis, total, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);

  const handleQuantityChange = (id: number, currentQty: number, maxStock: number, delta: number, permiteDetalle: boolean) => {
    // Si permite detalle y estamos decrementando a menos de 1, o si es fracción, usamos lógica especial
    // Por simplicidad en la UI para cajeros: +1/-1 a menos que sea detalle, donde podríamos permitir input manual.
    // Aquí implementamos +1 / -1 normal. Si permite detalle, idealmente sería un input type="number" step="0.01".
    
    let newQty = currentQty + delta;
    if (newQty < (permiteDetalle ? 0.01 : 1)) return;
    if (newQty > maxStock) {
       toast.error(`Stock insuficiente. Máximo disponible: ${maxStock}`);
       return;
    }
    updateQuantity(id, newQty);
  };

  const handleQuantityInput = (id: number, value: string, maxStock: number) => {
    const newQty = parseFloat(value);
    if (isNaN(newQty) || newQty <= 0) return;
    if (newQty > maxStock) {
      toast.error(`Stock insuficiente. Máximo disponible: ${maxStock}`);
      updateQuantity(id, maxStock);
      return;
    }
    updateQuantity(id, newQty);
  };

  const handleCobroSuccess = async (payload: any) => {
    // payload trae tipo_pago, monto_recibido, cliente_id
    const data = {
      ...payload,
      items: items.map(i => ({
        producto_id: i.id,
        cantidad: i.cantidad
      }))
    };

    const res = await api.post('/ventas', data);
    
    if (payload.tipo_pago === 'efectivo') {
      const vuelto = Math.round(payload.monto_recibido - total);
      toast.success(`Venta cobrada · Vuelto RD$${vuelto}`, { duration: 5000 });
    } else {
      toast.success('Venta a fiado registrada correctamente', { duration: 5000 });
    }
    
    clearCart();
    setIsCobroModalOpen(false);
  };

  return (
    <div className={`bg-surface border-l border-border flex flex-col h-full shadow-[inset_1px_0_0_0_rgba(0,0,0,0.05),-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative shrink-0 transition-all duration-300 ${items.length === 0 ? 'w-full md:w-64 lg:w-72' : 'w-full md:w-80 lg:w-96'}`}>
      <div className="p-5 border-b border-border flex items-center justify-between bg-surface shrink-0">
        <h2 className="text-xl font-extrabold text-ink flex items-center gap-2.5 font-display">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Carrito
        </h2>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button 
              onClick={clearCart}
              className="text-sm font-bold text-muted hover:text-error hover:bg-error/10 px-3 py-1.5 rounded-xl transition-colors"
            >
              Vaciar
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden p-2 text-muted hover:text-ink hover:bg-surface-2 rounded-full transition-colors ml-1"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted space-y-3 p-8">
            <ShoppingBag className="w-12 h-12 text-muted/40" />
            <p className="text-center font-medium text-sm max-w-[200px]">Selecciona un producto para agregarlo al carrito</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex flex-col p-4 bg-surface rounded-2xl border border-border shadow-sm group relative hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-3 pr-6">
                <span className="font-semibold text-ink leading-snug line-clamp-2 text-[15px]">{item.nombre}</span>
                <span className="font-extrabold text-ink shrink-0 ml-3">RD${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col gap-3 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-bold tracking-wide">RD${item.precio.toFixed(2)} {item.permiteDetalle ? `x ${item.unidad}` : 'C/U'}</span>
                  
                  <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-xl p-1">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.cantidad, item.stock, item.permiteDetalle ? -0.5 : -1, item.permiteDetalle)}
                      className="w-8 h-8 flex items-center justify-center text-ink hover:bg-surface hover:shadow-sm rounded-lg transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    {item.permiteDetalle ? (
                      <input 
                        type="number"
                        step="0.01"
                        value={item.cantidad}
                        onChange={(e) => handleQuantityInput(item.id, e.target.value, item.stock)}
                        className="w-14 text-center font-bold text-ink bg-transparent outline-none text-[15px] no-arrows"
                      />
                    ) : (
                      <span className="w-8 text-center font-bold text-ink text-[15px] tabular-nums">{item.cantidad}</span>
                    )}
                    
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.cantidad, item.stock, item.permiteDetalle ? 0.5 : 1, item.permiteDetalle)}
                      className="w-8 h-8 flex items-center justify-center text-ink hover:bg-surface hover:shadow-sm rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Fraction Buttons */}
                {item.permiteDetalle && item.unidad.toLowerCase() === 'libra' && (
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => updateQuantity(item.id, 0.5)} className="px-3 py-1 bg-surface-2 hover:bg-primary hover:text-white border border-border hover:border-primary rounded-lg text-xs font-bold text-muted transition-colors">½ lb</button>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 bg-surface-2 hover:bg-primary hover:text-white border border-border hover:border-primary rounded-lg text-xs font-bold text-muted transition-colors">1 lb</button>
                    <button onClick={() => updateQuantity(item.id, 2)} className="px-3 py-1 bg-surface-2 hover:bg-primary hover:text-white border border-border hover:border-primary rounded-lg text-xs font-bold text-muted transition-colors">2 lb</button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => removeItem(item.id)}
                className="absolute top-3 right-3 p-1.5 text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-surface border-t border-border mt-auto relative z-20 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.08)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6">
        <div className="space-y-2.5 mb-6">
          <div className="flex justify-between items-end pt-2">
            <span className="text-ink text-2xl font-extrabold font-display">Total de Orden</span>
            <span className="text-primary text-4xl font-extrabold tracking-tight font-tabular">RD${Math.round(total)}</span>
          </div>
          <p className="text-xs text-muted font-medium mt-1">Impuestos incluidos. Monto redondeado al peso.</p>
        </div>
        
        <button
          onClick={() => setIsCobroModalOpen(true)}
          disabled={items.length === 0}
          className={`w-full py-4.5 rounded-2xl font-extrabold text-[19px] text-white transition-all shadow-xl flex items-center justify-center gap-2 ${
            items.length === 0 
              ? 'bg-border text-muted shadow-none cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-700 hover:shadow-primary/30 hover:-translate-y-1'
          }`}
        >
          Cobrar RD${Math.round(total)}
        </button>
      </div>

      <CobroModal 
        isOpen={isCobroModalOpen} 
        onClose={() => setIsCobroModalOpen(false)} 
        total={total}
        onSuccess={handleCobroSuccess}
      />
    </div>
  );
}
