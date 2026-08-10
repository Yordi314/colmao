import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email y contraseña son requeridos' } });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!usuario || !usuario.activo) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Credenciales inválidas' } });
      return;
    }

    const isValid = await bcrypt.compare(password, usuario.password_hash);
    if (!isValid) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Credenciales inválidas' } });
      return;
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol.nombre },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  }
};

export const loginDemo = async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar al dueño demo (por email o buscando cualquier usuario con rol 'dueno')
    let usuario = await prisma.usuario.findFirst({
      where: { email: 'ramon@colmado.do', activo: true },
      include: { rol: true }
    });

    if (!usuario) {
      usuario = await prisma.usuario.findFirst({
        where: { rol: { nombre: 'dueno' }, activo: true },
        include: { rol: true }
      });
    }

    if (!usuario) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Usuario demo no encontrado' } });
      return;
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol.nombre },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
        esDemo: true
      }
    });
  } catch (error) {
    console.error('Demo Login error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  }
};
