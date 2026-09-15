"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClient = exports.getClients = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getClients = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Auto-create user if not exists for demo purposes since we trust the JWT
        await prisma_1.default.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId, email: req.user.email || 'unknown@example.com' }
        });
        const clients = await prisma_1.default.client.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(clients);
    }
    catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getClients = getClients;
const getClient = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const client = await prisma_1.default.client.findFirst({
            where: { id, userId }
        });
        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        res.json(client);
    }
    catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getClient = getClient;
const createClient = async (req, res) => {
    try {
        const { name, email, phone, status } = req.body;
        const userId = req.user?.id;
        if (!name) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Ensure user exists for foreign key constraint
        await prisma_1.default.user.upsert({
            where: { id: userId },
            update: {},
            create: { id: userId, email: req.user.email || 'unknown@example.com' }
        });
        const client = await prisma_1.default.client.create({
            data: {
                userId,
                name,
                email,
                phone,
                status: status || 'New',
            }
        });
        // Log activity
        await prisma_1.default.activityLog.create({
            data: {
                clientId: client.id,
                action: 'Created Lead/Client',
            }
        });
        res.status(201).json(client);
    }
    catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createClient = createClient;
const updateClient = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const { name, email, phone, status } = req.body;
        // Verify ownership
        const existing = await prisma_1.default.client.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        const client = await prisma_1.default.client.update({
            where: { id },
            data: { name, email, phone, status }
        });
        if (existing.status !== status) {
            await prisma_1.default.activityLog.create({
                data: {
                    clientId: client.id,
                    action: 'Stage Changed',
                    details: `Changed from ${existing.status} to ${status}`
                }
            });
        }
        res.json(client);
    }
    catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        // Verify ownership
        const existing = await prisma_1.default.client.findFirst({ where: { id, userId } });
        if (!existing) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        await prisma_1.default.activityLog.deleteMany({ where: { clientId: id } });
        await prisma_1.default.client.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteClient = deleteClient;
