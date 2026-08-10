import { storeActions } from "@/store/useStore";
import type { ItemVenta, Venta } from "@/types/domain";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const saleService = {
  async createVenta(carrito: ItemVenta[]): Promise<Venta> {
    await delay();
    return storeActions.procesarVenta(carrito);
  },
  async getVentas(): Promise<Venta[]> {
    await delay();
    return storeActions.getVentas();
  },
};
