"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvoice = exports.updateInvoiceStatus = exports.createInvoice = exports.getInvoices = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getInvoices = async (req, res) => {
    try {
        const userId = req.user?.id;
        const invoices = await prisma_1.default.invoice.findMany({
            where: {
                project: { client: { userId } }
            },
            include: {
                project: { include: { client: true } },
                lineItems: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getInvoices = getInvoices;
const createInvoice = async (req, res) => {
    try {
        const { projectId, amount, dueDate, lineItems } = req.body;
        const userId = req.user?.id;
        if (!projectId || amount === undefined || !dueDate) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const project = await prisma_1.default.project.findFirst({
            where: { id: projectId, client: { userId } }
        });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const invoice = await prisma_1.default.invoice.create({
            data: {
                projectId,
                amount,
                dueDate: new Date(dueDate),
                status: 'Unpaid',
                lineItems: {
                    create: lineItems || [] // [{ description, quantity, price }]
                }
            },
            include: { lineItems: true }
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createInvoice = createInvoice;
const updateInvoiceStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const { status } = req.body; // Unpaid, Paid, Overdue
        const existing = await prisma_1.default.invoice.findFirst({
            where: { id, project: { client: { userId } } }
        });
        if (!existing) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        const invoice = await prisma_1.default.invoice.update({
            where: { id },
            data: { status }
        });
        res.json(invoice);
    }
    catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateInvoiceStatus = updateInvoiceStatus;
const deleteInvoice = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const existing = await prisma_1.default.invoice.findFirst({
            where: { id, project: { client: { userId } } }
        });
        if (!existing) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        await prisma_1.default.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
        await prisma_1.default.invoice.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteInvoice = deleteInvoice;
