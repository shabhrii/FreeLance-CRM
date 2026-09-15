"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOverdueInvoices = exports.sendNotification = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id;
        const notification = await prisma_1.default.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        const updated = await prisma_1.default.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markAsRead = markAsRead;
const sendEmailAlert = async (to, subject, message) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.log(`[Email Service Mock] In-app notification created. Simulated email: "${subject}"`);
        return;
    }
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'FreelanceFlow <onboarding@resend.dev>',
                to: [to],
                subject,
                html: `<div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">FreelanceFlow Alert</h2>
          <p><strong>${subject}</strong></p>
          <p>${message}</p>
        </div>`,
            }),
        });
        const data = await res.json();
        console.log(`[Resend Email Sent]:`, data);
    }
    catch (err) {
        console.error('[Resend Email Error]:', err);
    }
};
const sendNotification = async (req, res) => {
    try {
        const userId = req.user?.id;
        const recipientEmail = req.user?.email || req.body.email || 'delivered@resend.dev';
        const { title, message } = req.body;
        if (!title || !message) {
            res.status(400).json({ error: 'Title and message are required' });
            return;
        }
        const notification = await prisma_1.default.notification.create({
            data: {
                userId,
                title,
                message,
            },
        });
        await sendEmailAlert(recipientEmail, title, message);
        res.status(201).json({ success: true, notification });
    }
    catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.sendNotification = sendNotification;
const checkOverdueInvoices = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const now = new Date();
        // Find all unpaid invoices where dueDate has passed for projects belonging to the user's clients
        const overdueInvoices = await prisma_1.default.invoice.findMany({
            where: {
                status: 'Unpaid',
                dueDate: { lt: now },
                project: {
                    client: {
                        userId,
                    },
                },
            },
            include: {
                project: {
                    include: {
                        client: true,
                    },
                },
            },
        });
        const updatedInvoices = [];
        const createdNotifications = [];
        for (const invoice of overdueInvoices) {
            // Update invoice status to Overdue
            const updated = await prisma_1.default.invoice.update({
                where: { id: invoice.id },
                data: { status: 'Overdue' },
            });
            updatedInvoices.push(updated);
            const clientName = invoice.project.client.name;
            const amount = invoice.amount.toFixed(2);
            const title = `Overdue Invoice Alert: ${clientName}`;
            const message = `Invoice for project "${invoice.project.name}" ($${amount}) was due on ${invoice.dueDate.toISOString().split('T')[0]} and is now overdue.`;
            // Create notification
            const notification = await prisma_1.default.notification.create({
                data: {
                    userId,
                    title,
                    message,
                },
            });
            createdNotifications.push(notification);
            // Log activity
            await prisma_1.default.activityLog.create({
                data: {
                    clientId: invoice.project.clientId,
                    action: 'Invoice Overdue',
                    details: `Invoice for $${amount} became overdue. Alert triggered.`,
                },
            });
            // Dispatch external email alert
            await sendEmailAlert(req.user?.email || 'delivered@resend.dev', title, message);
        }
        res.json({
            checkedCount: overdueInvoices.length,
            updatedInvoices,
            notificationsCreated: createdNotifications,
        });
    }
    catch (error) {
        console.error('Error checking overdue invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.checkOverdueInvoices = checkOverdueInvoices;
