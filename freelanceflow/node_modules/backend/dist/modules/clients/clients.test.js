"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clients_controller_1 = require("./clients.controller");
const prisma_1 = __importDefault(require("../../lib/prisma"));
jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            upsert: jest.fn(),
        },
        client: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        activityLog: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
    },
}));
describe('Clients Controller', () => {
    let mockReq;
    let mockRes;
    let jsonMock;
    let statusMock;
    beforeEach(() => {
        jest.clearAllMocks();
        prisma_1.default.user.upsert.mockResolvedValue({});
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockReq = {
            user: { id: 'user-123', email: 'test@example.com' },
            params: {},
            body: {},
        };
        mockRes = {
            json: jsonMock,
            status: statusMock,
        };
    });
    describe('getClients', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = undefined;
            await (0, clients_controller_1.getClients)(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
        });
        it('should fetch clients for the authenticated user and auto-upsert user', async () => {
            const mockClients = [
                { id: 'client-1', name: 'Acme Corp', userId: 'user-123', status: 'New' },
            ];
            prisma_1.default.user.upsert.mockResolvedValue({});
            prisma_1.default.client.findMany.mockResolvedValue(mockClients);
            await (0, clients_controller_1.getClients)(mockReq, mockRes);
            expect(prisma_1.default.user.upsert).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                update: {},
                create: { id: 'user-123', email: 'test@example.com' },
            });
            expect(prisma_1.default.client.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                orderBy: { updatedAt: 'desc' },
            });
            expect(jsonMock).toHaveBeenCalledWith(mockClients);
        });
        it('should return 500 when database throws an error', async () => {
            prisma_1.default.user.upsert.mockRejectedValue(new Error('DB failure'));
            await (0, clients_controller_1.getClients)(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
    describe('getClient', () => {
        it('should return single client if found and owned by user', async () => {
            mockReq.params = { id: 'client-1' };
            const mockClient = { id: 'client-1', name: 'Acme Corp', userId: 'user-123' };
            prisma_1.default.client.findFirst.mockResolvedValue(mockClient);
            await (0, clients_controller_1.getClient)(mockReq, mockRes);
            expect(prisma_1.default.client.findFirst).toHaveBeenCalledWith({
                where: { id: 'client-1', userId: 'user-123' },
            });
            expect(jsonMock).toHaveBeenCalledWith(mockClient);
        });
        it('should return 404 if client is not found', async () => {
            mockReq.params = { id: 'client-nonexistent' };
            prisma_1.default.client.findFirst.mockResolvedValue(null);
            await (0, clients_controller_1.getClient)(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Client not found' });
        });
    });
    describe('createClient', () => {
        it('should return 400 if client name is missing', async () => {
            mockReq.body = { email: 'client@example.com' };
            await (0, clients_controller_1.createClient)(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Name is required' });
        });
        it('should create client and record activity log', async () => {
            mockReq.body = {
                name: 'Globex Inc',
                email: 'contact@globex.com',
                phone: '1234567890',
                status: 'Contacted',
            };
            const createdClient = { id: 'client-2', ...mockReq.body, userId: 'user-123' };
            prisma_1.default.client.create.mockResolvedValue(createdClient);
            prisma_1.default.activityLog.create.mockResolvedValue({});
            await (0, clients_controller_1.createClient)(mockReq, mockRes);
            expect(prisma_1.default.client.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-123',
                    name: 'Globex Inc',
                    email: 'contact@globex.com',
                    phone: '1234567890',
                    status: 'Contacted',
                },
            });
            expect(prisma_1.default.activityLog.create).toHaveBeenCalledWith({
                data: {
                    clientId: 'client-2',
                    action: 'Created Lead/Client',
                },
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(createdClient);
        });
    });
    describe('updateClient', () => {
        it('should return 404 if client not found or not owned by user', async () => {
            mockReq.params = { id: 'client-1' };
            mockReq.body = { name: 'Updated Name', status: 'Won' };
            prisma_1.default.client.findFirst.mockResolvedValue(null);
            await (0, clients_controller_1.updateClient)(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Client not found' });
        });
        it('should update client and log stage change when status changes', async () => {
            mockReq.params = { id: 'client-1' };
            mockReq.body = { name: 'Updated Name', status: 'Won' };
            const existing = { id: 'client-1', name: 'Old Name', status: 'Contacted', userId: 'user-123' };
            const updated = { id: 'client-1', name: 'Updated Name', status: 'Won', userId: 'user-123' };
            prisma_1.default.client.findFirst.mockResolvedValue(existing);
            prisma_1.default.client.update.mockResolvedValue(updated);
            prisma_1.default.activityLog.create.mockResolvedValue({});
            await (0, clients_controller_1.updateClient)(mockReq, mockRes);
            expect(prisma_1.default.client.update).toHaveBeenCalledWith({
                where: { id: 'client-1' },
                data: { name: 'Updated Name', email: undefined, phone: undefined, status: 'Won' },
            });
            expect(prisma_1.default.activityLog.create).toHaveBeenCalledWith({
                data: {
                    clientId: 'client-1',
                    action: 'Stage Changed',
                    details: 'Changed from Contacted to Won',
                },
            });
            expect(jsonMock).toHaveBeenCalledWith(updated);
        });
    });
    describe('deleteClient', () => {
        it('should return 404 if client to delete does not exist', async () => {
            mockReq.params = { id: 'client-1' };
            prisma_1.default.client.findFirst.mockResolvedValue(null);
            await (0, clients_controller_1.deleteClient)(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Client not found' });
        });
        it('should delete activity logs and delete client', async () => {
            mockReq.params = { id: 'client-1' };
            const existing = { id: 'client-1', userId: 'user-123' };
            prisma_1.default.client.findFirst.mockResolvedValue(existing);
            prisma_1.default.activityLog.deleteMany.mockResolvedValue({ count: 2 });
            prisma_1.default.client.delete.mockResolvedValue(existing);
            await (0, clients_controller_1.deleteClient)(mockReq, mockRes);
            expect(prisma_1.default.activityLog.deleteMany).toHaveBeenCalledWith({ where: { clientId: 'client-1' } });
            expect(prisma_1.default.client.delete).toHaveBeenCalledWith({ where: { id: 'client-1' } });
            expect(jsonMock).toHaveBeenCalledWith({ success: true });
        });
    });
});
