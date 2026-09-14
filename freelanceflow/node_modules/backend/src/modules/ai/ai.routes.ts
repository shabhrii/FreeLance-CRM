import { Router } from 'express';
import { generateProposal, getClientHealth } from './ai.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/proposal', generateProposal);
router.get('/health/:clientId', getClientHealth);

export default router;
