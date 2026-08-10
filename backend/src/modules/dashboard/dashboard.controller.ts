import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getResumen = async (req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const ventasHoy = await prisma.venta.findMany({
      where: { fecha: { gte: hoy }, estado: 'completada' }
    });
    
    const ventasAyer = await prisma.venta.findMany({
      where: { fecha: { gte: ayer, lt: hoy }, estado: 'completada' }
    });

    const calcStats = (ventas: any[]) => {
      const ingresosEfectivo = ventas.filter(v => v.tipoPago === 'efectivo').reduce((acc, v) => acc + Number(v.total), 0);
      const ventasFiado = ventas.filter(v => v.tipoPago === 'fiado').reduce((acc, v) => acc + Number(v.total), 0);
      const ingresosTotales = ingresosEfectivo + ventasFiado;
      const ticketPromedio = ventas.length > 0 ? ingresosTotales / ventas.length : 0;
      return { ingresosEfectivo, ventasFiado, ingresosTotales, ticketPromedio, totalVentas: ventas.length };
    };

    const statsHoy = calcStats(ventasHoy);
    const statsAyer = calcStats(ventasAyer);

    const calcVariacion = (hoyVal: number, ayerVal: number) => {
      if (ayerVal === 0) return hoyVal > 0 ? null : 0;
      return ((hoyVal - ayerVal) / ayerVal) * 100;
    };

    // Fiado pendiente total global
    const fiadoTotal = await prisma.venta.aggregate({
      _sum: { total: true },
      where: { tipoPago: 'fiado', estado: 'completada' }
    });
    const abonosTotal = await prisma.abono.aggregate({
      _sum: { monto: true }
    });
    const fiadoPendiente = (Number(fiadoTotal._sum.total) || 0) - (Number(abonosTotal._sum.monto) || 0);

    res.json({
      data: { 
        hoy: statsHoy,
        variaciones: {
          ingresosEfectivo: calcVariacion(statsHoy.ingresosEfectivo, statsAyer.ingresosEfectivo),
          ventasFiado: calcVariacion(statsHoy.ventasFiado, statsAyer.ventasFiado),
          ventasTotales: calcVariacion(statsHoy.totalVentas, statsAyer.totalVentas),
          ticketPromedio: calcVariacion(statsHoy.ticketPromedio, statsAyer.ticketPromedio)
        },
        fiadoPendiente 
      }
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener resumen' } });
  }
};

export const getMasVendidos = async (req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const items = await prisma.ventaItem.findMany({
      where: { venta: { fecha: { gte: hoy }, estado: 'completada' } }
    });

    const mapa: Record<number, { nombre: string, cantidad: number }> = {};
    items.forEach(item => {
      if (!mapa[item.productoId]) {
        mapa[item.productoId] = { nombre: item.nombre, cantidad: 0 };
      }
      mapa[item.productoId].cantidad += Number(item.cantidad);
    });

    const ordenados = Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    res.json({ data: ordenados });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener más vendidos' } });
  }
};

export const getIngresosSemana = async (req: Request, res: Response): Promise<void> => {
  try {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 6);
    hace7Dias.setHours(0, 0, 0, 0);

    const ventas = await prisma.venta.findMany({
      where: { fecha: { gte: hace7Dias }, estado: 'completada' },
      select: { fecha: true, total: true }
    });

    // Agrupar por día
    const agrupado: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(hace7Dias);
      d.setDate(hace7Dias.getDate() + i);
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      agrupado[key] = 0;
    }

    ventas.forEach(v => {
      const key = v.fecha.toISOString().split('T')[0];
      if (agrupado[key] !== undefined) {
        agrupado[key] += Number(v.total);
      }
    });

    const data = Object.entries(agrupado).map(([fecha, total]) => ({
      fecha, 
      total
    }));

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener ingresos semanales' } });
  }
};

export const getRecomendacionesRestock = async (req: Request, res: Response): Promise<void> => {
  try {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    hace7Dias.setHours(0, 0, 0, 0);

    const productos = await prisma.producto.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, stock: true, stockMinimo: true }
    });

    const itemsVendidos = await prisma.ventaItem.groupBy({
      by: ['productoId'],
      where: { venta: { fecha: { gte: hace7Dias }, estado: 'completada' } },
      _sum: { cantidad: true }
    });

    const mapVendidos = new Map(itemsVendidos.map(i => [i.productoId, Number(i._sum.cantidad || 0)]));

    const recomendaciones = [];

    for (const p of productos) {
      const vendidos7Dias = mapVendidos.get(p.id) || 0;
      const ventasDiarias = vendidos7Dias / 7;
      
      let diasRestantes = 999;
      if (ventasDiarias > 0) {
        diasRestantes = p.stock / ventasDiarias;
      }

      if (p.stock <= p.stockMinimo || (diasRestantes < 3 && ventasDiarias > 0)) {
        recomendaciones.push({
          id: p.id,
          nombre: p.nombre,
          stock: p.stock,
          stockMinimo: p.stockMinimo,
          ventasDiarias,
          diasRestantes,
          urgente: diasRestantes < 1 || p.stock <= 0
        });
      }
    }

    recomendaciones.sort((a, b) => a.diasRestantes - b.diasRestantes);

    res.json({ data: recomendaciones.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener recomendaciones de restock' } });
  }
};

export const getFiadoAntiguo = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        ventas: { where: { tipoPago: 'fiado', estado: 'completada' } },
        abonos: true
      }
    });

    const fiadoAntiguo = [];
    
    for (const c of clientes) {
      const totalVentas = c.ventas.reduce((acc, v) => acc + Number(v.total), 0);
      const totalAbonos = c.abonos.reduce((acc, a) => acc + Number(a.monto), 0);
      const pendiente = totalVentas - totalAbonos;

      if (pendiente > 0 && c.ventas.length > 0) {
        // FIFO para encontrar de cuándo es la deuda más antigua que sigue pendiente
        const ventasOrdenadas = [...c.ventas].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        
        let abonoRestante = totalAbonos;
        let ventaAtrasoDate = ventasOrdenadas[0].fecha;
        
        for (const v of ventasOrdenadas) {
          if (abonoRestante >= Number(v.total)) {
            abonoRestante -= Number(v.total);
          } else {
            ventaAtrasoDate = v.fecha;
            break;
          }
        }

        const diasAtraso = Math.floor((new Date().getTime() - ventaAtrasoDate.getTime()) / (1000 * 60 * 60 * 24));
        
        fiadoAntiguo.push({
          id: c.id,
          nombre: c.nombre,
          telefono: c.telefono,
          pendiente,
          diasAtraso,
          ultimaVenta: ventaAtrasoDate
        });
      }
    }

    fiadoAntiguo.sort((a, b) => b.diasAtraso - a.diasAtraso);

    res.json({ data: fiadoAntiguo.slice(0, 6) }); // Top 6
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener deudas antiguas' } });
  }
};

export const getInventarioInmovilizado = async (req: Request, res: Response): Promise<void> => {
  try {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    hace30Dias.setHours(0,0,0,0);

    const productos = await prisma.producto.findMany({
      where: { stock: { gt: 0 }, activo: true }
    });

    const itemsVendidos30Dias = await prisma.ventaItem.findMany({
      where: { venta: { fecha: { gte: hace30Dias }, estado: 'completada' } },
      select: { productoId: true }
    });

    const productosConVenta = new Set(itemsVendidos30Dias.map(i => i.productoId));

    const inmovilizados = productos
      .filter(p => !productosConVenta.has(p.id))
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        stock: p.stock,
        precio: p.precio,
        costo: p.costo || p.precio * 0.7, // Asumir 70% de costo si es nulo
        dineroRetenido: p.stock * Number(p.costo || p.precio * 0.7)
      }))
      .sort((a, b) => b.dineroRetenido - a.dineroRetenido); 

    res.json({ data: inmovilizados.slice(0, 6) }); // Top 6 de plata muerta
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener inventario inmovilizado' } });
  }
};

export const getPatronVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    hace7Dias.setHours(0,0,0,0);

    const ventas = await prisma.venta.findMany({
      where: { fecha: { gte: hace7Dias }, estado: 'completada' },
      select: { fecha: true }
    });

    // Rango horario típico de colmado (8 AM a 10 PM)
    const horas: Record<number, number> = {};
    for (let i = 8; i <= 22; i++) horas[i] = 0; 

    ventas.forEach(v => {
      const h = v.fecha.getHours(); 
      if (horas[h] !== undefined) {
        horas[h] += 1; 
      }
    });

    const data = Object.entries(horas).map(([hora, cantidad]) => {
      const hNum = Number(hora);
      const ampm = hNum >= 12 ? 'PM' : 'AM';
      const hStr = hNum > 12 ? hNum - 12 : (hNum === 0 ? 12 : hNum);
      return { hora: `${hStr} ${ampm}`, cantidad };
    });

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener patrón de ventas' } });
  }
};
