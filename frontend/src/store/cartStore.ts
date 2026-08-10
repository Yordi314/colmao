import { create } from 'zustand';

export interface CartItem {
  id: number; // Producto ID
  nombre: string;
  precio: number;
  cantidad: number;
  unidad: string;
  permiteDetalle: boolean;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (id: number, cantidad: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  subtotal: number;
  itbis: number;
  total: number;
}

const calculateTotals = (items: CartItem[]) => {
  const sum = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const total = Math.round(sum);
  const itbis = 0; // Calculado en el backend
  const subtotal = total; // Para no romper UI que espera subtotal
  return { subtotal, itbis, total };
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  itbis: 0,
  total: 0,

  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    let newItems;
    if (existing) {
      newItems = state.items.map(i => 
        i.id === product.id 
          ? { ...i, cantidad: i.cantidad + 1 } 
          : i
      );
    } else {
      newItems = [...state.items, { ...product, cantidad: 1 }];
    }
    return { items: newItems, ...calculateTotals(newItems) };
  }),

  updateQuantity: (id, cantidad) => set((state) => {
    const newItems = state.items.map(i => i.id === id ? { ...i, cantidad } : i);
    return { items: newItems, ...calculateTotals(newItems) };
  }),

  removeItem: (id) => set((state) => {
    const newItems = state.items.filter(i => i.id !== id);
    return { items: newItems, ...calculateTotals(newItems) };
  }),

  clearCart: () => set({ items: [], subtotal: 0, itbis: 0, total: 0 }),
}));
