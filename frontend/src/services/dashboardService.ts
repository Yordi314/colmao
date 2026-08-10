import { storeActions } from "@/store/useStore";
import { formatDiaCorto, isSameDay, round2 } from "@/lib/format";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const dashboardService = {
  async getMetricasHoy() {
    await delay();
    const hoy = new Date();
    const ventasHoy = storeActions.getVentas().filter((v) => isSameDay(new Date(v.fecha), hoy));
    const ingresosHoy = round2(ventasHoy.reduce((s, v) => s + v.total, 0));
    const ticketPromedio = ventasHoy.length > 0 ? round2(ingresosHoy / ventasHoy.length) : 0;
    return { ingresosHoy, ventasHoy: ventasHoy.length, ticketPromedio };
  },
  async getIngresosUltimos7Dias() {
    await delay();
    const ventas = storeActions.getVentas();
    const result: { dia: string; fechaISO: string; ingresos: number }[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - offset);
      const ingresos = round2(
        ventas
          .filter((v) => isSameDay(new Date(v.fecha), d))
          .reduce((s, v) => s + v.total, 0),
      );
      result.push({ dia: formatDiaCorto(d), fechaISO: d.toISOString(), ingresos });
    }
    return result;
  },
};
