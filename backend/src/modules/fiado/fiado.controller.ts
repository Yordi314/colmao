import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buscar } = req.query;
    const clientes = await prisma.cliente.findMany({
      where: buscar ? { nombre: { contains: String(buscar) } } : {},
      orderBy: { nombre: 'asc' }
    });

    // Calcular saldo derivado: Ventas Fiado - Abonos
    // En un sistema con mucha data esto se hace con SQL crudo o vistas, pero para el prototipo lo haremos en memoria/batch
    const result = await Promise.all(clientes.map(async (c) => {
      const ventasFiado = await prisma.venta.aggregate({
        _sum: { total: true },
        where: { clienteId: c.id, tipoPago: 'fiado', estado: 'completada' }
      });
      const abonos = await prisma.abono.aggregate({
        _sum: { monto: true },
        where: { clienteId: c.id }
      });
      const saldo = (Number(ventasFiado._sum.total) || 0) - (Number(abonos._sum.monto) || 0);
      return { ...c, saldo };
    }));

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener clientes' } });
  }
};

export const getCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) }
    });
    if (!cliente) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' } });
      return;
    }
    // Saldo
    const ventasFiado = await prisma.venta.aggregate({
      _sum: { total: true },
      where: { clienteId: cliente.id, tipoPago: 'fiado', estado: 'completada' }
    });
    const abonosSum = await prisma.abono.aggregate({
      _sum: { monto: true },
      where: { clienteId: cliente.id }
    });
    const saldo = (Number(ventasFiado._sum.total) || 0) - (Number(abonosSum._sum.monto) || 0);

    const ventas = await prisma.venta.findMany({ where: { clienteId: cliente.id, tipoPago: 'fiado' }, orderBy: { fecha: 'desc' } });
    const abonos = await prisma.abono.findMany({ where: { clienteId: cliente.id }, orderBy: { fecha: 'desc' } });

    // Combinar en movimientos
    const movimientos = [
      ...ventas.map(v => ({ tipo: 'cargo', monto: Number(v.total), fecha: v.fecha })),
      ...abonos.map(a => ({ tipo: 'abono', monto: Number(a.monto), fecha: a.fecha }))
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    res.json({ data: { ...cliente, saldo, movimientos } });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener cliente' } });
  }
};

export const registrarAbono = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { monto } = req.body;
    const usuarioId = (req as any).user.id;

    if (!monto || monto <= 0) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'El monto debe ser mayor a 0' } });
      return;
    }

    const abono = await prisma.abono.create({
      data: {
        clienteId: Number(id),
        monto: Number(monto),
        usuarioId
      }
    });

    res.status(201).json({ data: abono });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al registrar abono' } });
  }
};

export const crearCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, telefono, limiteCredito } = req.body;
    if (!nombre) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'El nombre es obligatorio' } });
      return;
    }

    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        limiteCredito: Number(limiteCredito) || 0
      }
    });

    res.status(201).json({ data: { ...nuevoCliente, saldo: 0 } });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al crear cliente' } });
  }
};

export const eliminarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if client has history
    const ventasCount = await prisma.venta.count({ where: { clienteId: Number(id) } });
    const abonosCount = await prisma.abono.count({ where: { clienteId: Number(id) } });
    
    if (ventasCount > 0 || abonosCount > 0) {
      // Cannot hard delete. Deactivate instead.
      await prisma.cliente.update({
        where: { id: Number(id) },
        data: { activo: false }
      });
      res.json({ 
        message: 'El cliente tiene historial y no puede ser borrado. Ha sido desactivado para futuras ventas.',
        status: 'desactivado'
      });
    } else {
      // Hard delete
      await prisma.cliente.delete({ where: { id: Number(id) } });
      res.json({ 
        message: 'Cliente eliminado definitivamente.',
        status: 'eliminado'
      });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al procesar la solicitud' } });
  }
};
