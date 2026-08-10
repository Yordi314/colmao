import { Request, Response } from 'express';
import { VentaService } from './ventas.service';
import prisma from '../../config/prisma';

export const registrarVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = (req as any).user.id;
    const venta = await VentaService.registrarVenta(req.body, usuarioId);
    res.status(201).json({ data: venta });
  } catch (error: any) {
    // Si es un error de negocio de nuestro servicio, lo mandamos como 400
    if (error.message) {
       res.status(400).json({ error: { code: 'BAD_REQUEST', message: error.message } });
       return;
    }
    console.error('Error registrarVenta:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  }
};

export const getVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const ventas = await prisma.venta.findMany({
      orderBy: { fecha: 'desc' },
      take: 50,
      include: {
        usuario: { select: { nombre: true } },
        cliente: { select: { nombre: true } },
        items: true
      }
    });
    res.json({ data: ventas });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener ventas' } });
  }
};
