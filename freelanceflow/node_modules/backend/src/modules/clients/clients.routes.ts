import { Router } from 'express';
import { getClients, getClient, createClient, updateClient, deleteClient } from './clients.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
