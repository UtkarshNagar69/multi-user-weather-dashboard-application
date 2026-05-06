import { Router } from 'express';
import { chat, insights } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/chat', chat);
router.get('/insights', insights);

export default router;
