import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  getNotifications,
  markAsRead,
  sendNotification,
  checkOverdueInvoices,
} from './notifications.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/send', sendNotification);
router.post('/check-overdue', checkOverdueInvoices);

export default router;
