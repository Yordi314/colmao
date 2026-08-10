import { Router } from 'express';
import { getProductos, getCategorias } from './productos.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Usamos el mismo router para categorías aquí por simplicidad inicial, 
// o se podría separar en modules/categorias
router.get('/productos', authenticate, getProductos);
router.get('/categorias', authenticate, getCategorias);

export default router;
