import { storeActions } from "@/store/useStore";
import { estadoStock } from "@/lib/format";
import type { Producto } from "@/types/domain";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const productService = {
  async getProductos(): Promise<Producto[]> {
    await delay();
    return storeActions.getProductos();
  },
  async getProducto(id: string) {
    await delay();
    return storeActions.getProducto(id);
  },
  async getStockCritico(): Promise<Producto[]> {
    await delay();
    const orden = { critico: 0, bajo: 1, ok: 2 } as const;
    return storeActions
      .getProductos()
      .filter((p) => estadoStock(p) !== "ok")
      .sort((a, b) => orden[estadoStock(a)] - orden[estadoStock(b)]);
  },
};
