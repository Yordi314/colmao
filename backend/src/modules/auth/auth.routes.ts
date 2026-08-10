import { Router } from 'express';
import { login, loginDemo } from './auth.controller';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/demo', loginDemo);

router.get('/me', authenticate, (req: AuthRequest, res) => {
  res.json({ data: req.user });
});

export default router;
