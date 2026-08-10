import { Router } from 'express';
import { getClientes, getCliente, registrarAbono, crearCliente, eliminarCliente } from './fiado.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/clientes', authenticate, getClientes);
router.post('/clientes', authenticate, crearCliente);
router.get('/clientes/:id', authenticate, getCliente);
router.post('/clientes/:id/abonos', authenticate, registrarAbono);
router.delete('/clientes/:id', authenticate, eliminarCliente);

export default router;
