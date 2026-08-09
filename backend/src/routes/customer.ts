import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, addFollowUpNote } from '../controllers/customer';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // Require authentication for all customer routes

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.post('/:id/notes', addFollowUpNote);

export default router;
