import { Router } from 'express';
import { getDashboardAnalytics } from './analytics.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getDashboardAnalytics);

export default router;
