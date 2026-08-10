import { Router } from 'express';
import { getResumen, getMasVendidos, getIngresosSemana, getRecomendacionesRestock, getFiadoAntiguo, getInventarioInmovilizado, getPatronVentas } from './dashboard.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/dashboard/resumen', authenticate, requireRole(['dueno']), getResumen);
router.get('/dashboard/mas-vendidos', authenticate, requireRole(['dueno']), getMasVendidos);
router.get('/dashboard/ingresos-semana', authenticate, requireRole(['dueno']), getIngresosSemana);
router.get('/dashboard/recomendaciones', authenticate, requireRole(['dueno']), getRecomendacionesRestock);
router.get('/dashboard/fiado-atencion', authenticate, requireRole(['dueno']), getFiadoAntiguo);
router.get('/dashboard/inmovilizado', authenticate, requireRole(['dueno']), getInventarioInmovilizado);
router.get('/dashboard/patron-horas', authenticate, requireRole(['dueno']), getPatronVentas);

export default router;
