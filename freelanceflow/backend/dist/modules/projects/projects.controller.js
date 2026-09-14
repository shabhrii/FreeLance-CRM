"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjects = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getProjects = async (req, res) => {
    try {
        const userId = req.user?.id;
        // We only want projects for clients owned by the user
        const projects = await prisma_1.default.project.findMany({
            where: {
                client: { userId }
            },
            include: {
                client: true
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(projects);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProjects = getProjects;
const createProject = async (req, res) => {
    try {
        const { clientId, name, status, startDate, dueDate } = req.body;
        const userId = req.user?.id;
        if (!clientId || !name) {
            res.status(400).json({ error: 'Client ID and name are required' });
            return;
        }
        // Verify client belongs to user
        const client = await prisma_1.default.client.findFirst({ where: { id: clientId, userId } });
        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        const project = await prisma_1.default.project.create({
            data: {
                clientId,
                name,
                status: status || 'Not started',
                startDate: startDate ? new Date(startDate) : null,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
            include: { client: true }
        });
        await prisma_1.default.activityLog.create({
            data: {
                clientId,
                action: 'Created Project',
                details: `Project "${name}" created.`
            }
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const { name, status, startDate, dueDate } = req.body;
        const existing = await prisma_1.default.project.findFirst({
            where: { id, client: { userId } }
        });
        if (!existing) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const project = await prisma_1.default.project.update({
            where: { id },
            data: {
                name,
                status,
                startDate: startDate ? new Date(startDate) : null,
                dueDate: dueDate ? new Date(dueDate) : null
            },
            include: { client: true }
        });
        res.json(project);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const existing = await prisma_1.default.project.findFirst({
            where: { id, client: { userId } }
        });
        if (!existing) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        // Check if invoices exist
        const invoicesCount = await prisma_1.default.invoice.count({ where: { projectId: id } });
        if (invoicesCount > 0) {
            res.status(400).json({ error: 'Cannot delete project with existing invoices' });
            return;
        }
        await prisma_1.default.project.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteProject = deleteProject;
