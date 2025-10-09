import { Router } from 'express';
import { register, login, logout, verifySession } from '../controllers/auth.controller';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', authenticateToken, logout);
router.get('/verify', authenticateToken, verifySession);

export default router;
