import { Router } from 'express';
import { getAlertasStock, crearProducto, actualizarProducto, ajustarStock } from './inventario.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/inventario/alertas', authenticate, requireRole(['dueno']), getAlertasStock);
router.post('/inventario/productos', authenticate, requireRole(['dueno']), crearProducto);
router.put('/inventario/productos/:id', authenticate, requireRole(['dueno']), actualizarProducto);
router.patch('/inventario/productos/:id/stock', authenticate, requireRole(['dueno']), ajustarStock);

export default router;
