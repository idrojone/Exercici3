import { Router } from 'express';
import { register, login, getUsers, logout } from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { log } from 'console';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/users', authMiddleware, getUsers);

export default router;
