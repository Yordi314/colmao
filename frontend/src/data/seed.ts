import type { Categoria, Producto, Venta, ItemVenta } from "@/types/domain";
import { ITBIS_RATE, round2 } from "@/lib/format";

export const categorias: Categoria[] = [
  { id: "abarrotes", nombre: "Abarrotes", emoji: "🛒" },
  { id: "bebidas", nombre: "Bebidas", emoji: "🥤" },
  { id: "lacteos", nombre: "Lácteos", emoji: "🥛" },
  { id: "limpieza", nombre: "Limpieza", emoji: "🧼" },
  { id: "snacks", nombre: "Snacks", emoji: "🍪" },
  { id: "viveres", nombre: "Víveres", emoji: "🍌" },
  { id: "embutidos", nombre: "Embutidos", emoji: "🥩" },
];

export const productosSeed: Producto[] = [
  { id: "p01", nombre: "Arroz Selecto 1 lb", categoria: "abarrotes", precio: 38, stock: 40, stockMinimo: 10, emoji: "🍚", activo: true },
  { id: "p02", nombre: "Habichuelas Rojas 1 lb", categoria: "abarrotes", precio: 55, stock: 25, stockMinimo: 8, emoji: "🫘", activo: true },
  { id: "p03", nombre: "Aceite Vegetal 1 L", categoria: "abarrotes", precio: 165, stock: 9, stockMinimo: 6, emoji: "🫒", activo: true },
  { id: "p04", nombre: "Spaghetti 1 lb", categoria: "abarrotes", precio: 42, stock: 30, stockMinimo: 10, emoji: "🍝", activo: true },
  { id: "p05", nombre: "Leche en Polvo 400 g", categoria: "lacteos", precio: 220, stock: 8, stockMinimo: 10, emoji: "🥛", activo: true },
  { id: "p06", nombre: "Huevos (unidad)", categoria: "lacteos", precio: 12, stock: 60, stockMinimo: 24, emoji: "🥚", activo: true },
  { id: "p07", nombre: "Coca-Cola 2 L", categoria: "bebidas", precio: 110, stock: 18, stockMinimo: 8, emoji: "🥤", activo: true },
  { id: "p08", nombre: "Agua Cristal 1 gal", categoria: "bebidas", precio: 60, stock: 4, stockMinimo: 12, emoji: "💧", activo: true },
  { id: "p09", nombre: "Jugo Rica 1 L", categoria: "bebidas", precio: 85, stock: 20, stockMinimo: 8, emoji: "🧃", activo: true },
  { id: "p10", nombre: "Jabón de Cuaba", categoria: "limpieza", precio: 25, stock: 35, stockMinimo: 10, emoji: "🧼", activo: true },
  { id: "p11", nombre: "Detergente 1 kg", categoria: "limpieza", precio: 145, stock: 7, stockMinimo: 6, emoji: "🧴", activo: true },
  { id: "p12", nombre: "Papel Higiénico 4u", categoria: "limpieza", precio: 90, stock: 14, stockMinimo: 8, emoji: "🧻", activo: true },
  { id: "p13", nombre: "Galletas Hatuey", categoria: "snacks", precio: 35, stock: 40, stockMinimo: 12, emoji: "🍪", activo: true },
  { id: "p14", nombre: "Plátano (unidad)", categoria: "viveres", precio: 15, stock: 50, stockMinimo: 20, emoji: "🍌", activo: true },
  { id: "p15", nombre: "Salami Induveca 1 lb", categoria: "embutidos", precio: 130, stock: 10, stockMinimo: 6, emoji: "🥩", activo: true },
];

// Seeded pseudo-random for reproducible histórico
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generarVentasHistoricas(productos: Producto[]): Venta[] {
  const rand = mulberry32(42);
  const ventas: Venta[] = [];
  let ventaId = 1;

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const fecha = new Date();
    fecha.setHours(10, 0, 0, 0);
    fecha.setDate(fecha.getDate() - dayOffset);

    const minVentas = dayOffset === 0 ? 4 : 4;
    const numVentas = minVentas + Math.floor(rand() * 6); // 4-9

    for (let v = 0; v < numVentas; v++) {
      const numItems = 1 + Math.floor(rand() * 5); // 1-5
      const items: ItemVenta[] = [];
      const usados = new Set<string>();
      for (let i = 0; i < numItems; i++) {
        const prod = productos[Math.floor(rand() * productos.length)];
        if (usados.has(prod.id)) continue;
        usados.add(prod.id);
        const cantidad = 1 + Math.floor(rand() * 4);
        const importe = round2(prod.precio * cantidad);
        items.push({
          productoId: prod.id,
          nombre: prod.nombre,
          precioUnitario: prod.precio,
          cantidad,
          importe,
        });
      }
      if (items.length === 0) continue;

      const subtotal = round2(items.reduce((s, it) => s + it.importe, 0));
      const itbis = round2(subtotal * ITBIS_RATE);
      const total = round2(subtotal + itbis);
      const cantidadItems = items.reduce((s, it) => s + it.cantidad, 0);

      const fechaVenta = new Date(fecha);
      fechaVenta.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60), 0, 0);

      ventas.push({
        id: `vs-${String(ventaId++).padStart(4, "0")}`,
        fecha: fechaVenta.toISOString(),
        items,
        cantidadItems,
        subtotal,
        itbis,
        total,
      });
    }
  }

  return ventas;
}
