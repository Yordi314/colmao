import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { ShoppingBag } from 'lucide-react';

export default function PosPage() {
  const { isMobileCartOpen, setMobileCartOpen } = useUIStore();
  const { items, total } = useCartStore();

  const totalItems = items.reduce((acc, item) => acc + (item.permiteDetalle ? 1 : item.cantidad), 0);

  return (
    <div className="flex h-full w-full overflow-hidden relative bg-bg">
      <div className="flex-1 overflow-hidden min-w-0 h-full">
        <ProductGrid />
      </div>
      
      {/* Overlay for mobile bottom sheet */}
      {isMobileCartOpen && (
        <div 
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileCartOpen(false)}
        />
      )}

      {/* CartPanel Container */}
      <div className={`
        fixed md:static inset-x-0 bottom-0 z-50 md:z-0
        transition-transform duration-300 ease-out transform
        ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        h-[85vh] md:h-full shrink-0
        rounded-t-3xl md:rounded-none overflow-hidden shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-none
      `}>
        <CartPanel onClose={() => setMobileCartOpen(false)} />
      </div>

      {/* Floating Action Button (Mobile only) */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-30">
        <button 
          onClick={() => setMobileCartOpen(true)}
          className="w-full bg-ink text-white p-4 rounded-2xl shadow-elevated font-bold flex justify-between items-center transition-transform active:scale-95"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="text-[15px]">Ver orden · <span className="text-primary">{items.length} ítems</span></span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">RD${total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}
