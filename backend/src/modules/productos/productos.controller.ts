import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { buscar, categoria, frecuentes } = req.query;
    
    let where: any = { activo: true };
    
    if (buscar) {
      where.nombre = { contains: String(buscar) /* en SQLite contains es case-insensitive por defecto */ };
    }
    if (categoria) {
      where.categoriaId = Number(categoria);
    }
    if (frecuentes === 'true') {
      where.esFrecuente = true;
    }

    const productos = await prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy: { nombre: 'asc' }
    });

    res.json({ data: productos });
  } catch (error) {
    console.error('Error fetching productos:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener productos' } });
  }
};

export const getCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { orden: 'asc' }
    });
    res.json({ data: categorias });
  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error al obtener categorias' } });
  }
};
