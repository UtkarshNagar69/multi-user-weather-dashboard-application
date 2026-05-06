import { Router } from 'express';
import {
  getDashboard,
  addCity,
  toggleFavorite,
  removeCity,
} from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All dashboard routes are protected
router.use(authMiddleware);

router.get('/', getDashboard);
router.post('/cities', addCity);
router.patch('/cities/:cityName/favorite', toggleFavorite);
router.delete('/cities/:cityName', removeCity);

export default router;
