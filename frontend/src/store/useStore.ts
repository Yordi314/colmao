import { useSyncExternalStore } from "react";
import type { ItemVenta, Producto, Venta } from "@/types/domain";
import { ITBIS_RATE, round2 } from "@/lib/format";
import { generarVentasHistoricas, productosSeed } from "@/data/seed";

interface State {
  productos: Producto[];
  ventas: Venta[];
}

let state: State = {
  productos: productosSeed.map((p) => ({ ...p })),
  ventas: generarVentasHistoricas(productosSeed),
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getState = () => state;

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(getState()),
  );
}

export const storeActions = {
  getProductos: () => state.productos,
  getProducto: (id: string) => state.productos.find((p) => p.id === id),
  getVentas: () => state.ventas,
  procesarVenta(carrito: ItemVenta[]): Venta {
    if (carrito.length === 0) throw new Error("El carrito está vacío");
    // validar stock
    for (const item of carrito) {
      const prod = state.productos.find((p) => p.id === item.productoId);
      if (!prod) throw new Error(`Producto no encontrado: ${item.nombre}`);
      if (prod.stock < item.cantidad)
        throw new Error(`Stock insuficiente para "${prod.nombre}"`);
    }
    const items = carrito.map((i) => ({
      ...i,
      importe: round2(i.precioUnitario * i.cantidad),
    }));
    const subtotal = round2(items.reduce((s, it) => s + it.importe, 0));
    const itbis = round2(subtotal * ITBIS_RATE);
    const total = round2(subtotal + itbis);
    const cantidadItems = items.reduce((s, it) => s + it.cantidad, 0);

    const venta: Venta = {
      id: `v-${Date.now()}`,
      fecha: new Date().toISOString(),
      items,
      cantidadItems,
      subtotal,
      itbis,
      total,
    };

    const nuevosProductos = state.productos.map((p) => {
      const it = items.find((i) => i.productoId === p.id);
      return it ? { ...p, stock: p.stock - it.cantidad } : p;
    });
    state = { productos: nuevosProductos, ventas: [...state.ventas, venta] };
    emit();
    return venta;
  },
};
