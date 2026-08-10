import { Router } from 'express';
import { registrarVenta, getVentas } from './ventas.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/ventas', authenticate, registrarVenta);
router.get('/ventas', authenticate, getVentas);

export default router;
