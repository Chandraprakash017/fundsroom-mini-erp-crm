import { Router } from 'express';
import { getInventoryLogs, recordMovement } from '../controllers/inventory';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/logs', getInventoryLogs);
router.post('/movement', recordMovement);

export default router;
