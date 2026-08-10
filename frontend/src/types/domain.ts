export type CategoriaId =
  | "abarrotes"
  | "bebidas"
  | "lacteos"
  | "limpieza"
  | "snacks"
  | "viveres"
  | "embutidos";

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  emoji: string;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: CategoriaId;
  precio: number;
  stock: number;
  stockMinimo: number;
  emoji: string;
  activo: boolean;
}

export interface ItemVenta {
  productoId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  importe: number;
}

export interface Venta {
  id: string;
  fecha: string;
  items: ItemVenta[];
  cantidadItems: number;
  subtotal: number;
  itbis: number;
  total: number;
}

export type EstadoStock = "ok" | "bajo" | "critico";
