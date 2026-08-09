import { Router } from 'express';
import { getChallans, createChallan, confirmChallan, cancelChallan } from '../controllers/challan';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getChallans);
router.post('/', createChallan);
router.post('/:id/confirm', confirmChallan);
router.post('/:id/cancel', cancelChallan);

export default router;
