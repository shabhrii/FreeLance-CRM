import { Router } from 'express';
import { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice } from './invoices.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.put('/:id/status', updateInvoiceStatus);
router.delete('/:id', deleteInvoice);

export default router;
