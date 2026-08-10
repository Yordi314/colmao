import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getAlertasStock = async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar productos cuyo stock actual sea menor o igual a stockMinimo y que estén activos
    const alertas = await prisma.producto.findMany({
      where: {
        activo: true,
        // Prisma no permite comparar dos campos de la misma tabla directamente en `where` estándar,
        // pero podemos obtener todos o usar una raw query si es muy pesado. Como es SQLite y pocos datos,
        // lo filtramos en JS o usamos Prisma Extensions. Para asegurar, iteramos y filtramos.
      },
      select: {
        id: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
        unidad: true
      }
    });

    const filtrados = alertas.filter((p: any) => p.stock <= p.stockMinimo);

    res.json({ data: filtrados });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener alertas de stock' } });
  }
};

export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const producto = await prisma.producto.create({
      data: {
        nombre: data.nombre,
        categoriaId: Number(data.categoriaId),
        precio: Number(data.precio),
        costo: data.costo ? Number(data.costo) : null,
        stock: Number(data.stock),
        stockMinimo: Number(data.stockMinimo),
        unidad: data.unidad || 'ud',
        permiteDetalle: Boolean(data.permiteDetalle),
        esFrecuente: Boolean(data.esFrecuente),
        emoji: data.emoji || '📦'
      }
    });
    res.status(201).json({ data: producto });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al crear producto' } });
  }
};

export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.categoriaId !== undefined) updateData.categoriaId = Number(data.categoriaId);
    if (data.precio !== undefined) updateData.precio = Number(data.precio);
    if (data.costo !== undefined) updateData.costo = Number(data.costo);
    if (data.stockMinimo !== undefined) updateData.stockMinimo = Number(data.stockMinimo);
    if (data.unidad !== undefined) updateData.unidad = data.unidad;
    if (data.permiteDetalle !== undefined) updateData.permiteDetalle = Boolean(data.permiteDetalle);
    if (data.esFrecuente !== undefined) updateData.esFrecuente = Boolean(data.esFrecuente);
    if (data.emoji !== undefined) updateData.emoji = data.emoji;

    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: updateData
    });

    res.json({ data: producto });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al actualizar producto' } });
  }
};

export const ajustarStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cantidad, motivo } = req.body;
    const usuarioId = (req as any).user.id;

    if (!cantidad) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'La cantidad es obligatoria' } });
      return;
    }

    const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
    if (!producto) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } });
      return;
    }

    // Ejecutar en transacción para asegurar integridad
    await prisma.$transaction(async (tx: any) => {
      await tx.producto.update({
        where: { id: Number(id) },
        data: { stock: Number(producto.stock) + Number(cantidad) }
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: Number(id),
          usuarioId,
          tipo: Number(cantidad) > 0 ? 'entrada' : 'salida',
          cantidad: Math.abs(Number(cantidad)),
          motivo: motivo || 'Ajuste manual'
        }
      });
    });

    res.json({ message: 'Stock ajustado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al ajustar stock' } });
  }
};
