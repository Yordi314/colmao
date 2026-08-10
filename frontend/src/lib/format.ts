import type { EstadoStock, Producto } from "@/types/domain";

export const ITBIS_RATE = 0.18;

const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatRD = (monto: number): string =>
  currencyFormatter.format(Number.isFinite(monto) ? monto : 0);

export const round2 = (n: number): number => Math.round(n * 100) / 100;

const longDateFormatter = new Intl.DateTimeFormat("es-DO", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});
export const formatFechaLarga = (d: Date): string => longDateFormatter.format(d);

const shortDayFormatter = new Intl.DateTimeFormat("es-DO", { weekday: "short" });
export const formatDiaCorto = (d: Date): string =>
  shortDayFormatter.format(d).replace(".", "").toLowerCase();

export const estadoStock = (p: Producto): EstadoStock => {
  if (p.stock <= p.stockMinimo) return "critico";
  if (p.stock <= p.stockMinimo * 1.5) return "bajo";
  return "ok";
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
