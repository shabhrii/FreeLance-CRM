"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiController = __importStar(require("./ai.controller"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
jest.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: {
        client: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));
describe('AI Controller', () => {
    let mockReq;
    let mockRes;
    let jsonMock;
    let statusMock;
    beforeEach(() => {
        jest.clearAllMocks();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockReq = {
            user: { id: 'user-1' },
            body: {},
            params: {},
        };
        mockRes = {
            json: jsonMock,
            status: statusMock,
        };
    });
    describe('When GROQ is not available (Fallback / Graceful Degradation)', () => {
        let spyGroq;
        beforeEach(() => {
            spyGroq = jest.spyOn(aiController, 'getGroqClient').mockReturnValue(null);
        });
        afterEach(() => {
            spyGroq.mockRestore();
        });
        it('generateProposal should return 503 with service unavailable error', async () => {
            mockReq.body = { clientId: 'client-1', projectScope: 'SEO', budget: 500, timeline: '1 week' };
            await aiController.generateProposal(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(503);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
        });
        it('getClientHealth should return 503 with service unavailable error', async () => {
            mockReq.params = { clientId: 'client-1' };
            await aiController.getClientHealth(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(503);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
        });
    });
    describe('When GROQ is available', () => {
        let mockCreate;
        let spyGroq;
        beforeEach(() => {
            mockCreate = jest.fn();
            const mockGroqInstance = {
                chat: {
                    completions: {
                        create: mockCreate,
                    },
                },
            };
            spyGroq = jest.spyOn(aiController, 'getGroqClient').mockReturnValue(mockGroqInstance);
        });
        afterEach(() => {
            spyGroq.mockRestore();
        });
        it('generateProposal should return 404 if client does not exist', async () => {
            mockReq.body = { clientId: 'client-unknown', projectScope: 'Web App', budget: 3000, timeline: '1 month' };
            prisma_1.default.client.findFirst.mockResolvedValue(null);
            await aiController.generateProposal(mockReq, mockRes);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Client not found' });
        });
        it('generateProposal should call Groq and return the proposal', async () => {
            mockReq.body = { clientId: 'client-1', projectScope: 'Web App', budget: 3000, timeline: '1 month' };
            prisma_1.default.client.findFirst.mockResolvedValue({ id: 'client-1', name: 'Initech' });
            mockCreate.mockResolvedValue({
                choices: [{ message: { content: 'Professional proposal for Initech...' } }],
            });
            await aiController.generateProposal(mockReq, mockRes);
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                messages: expect.arrayContaining([
                    expect.objectContaining({ role: 'user', content: expect.stringContaining('Initech') }),
                ]),
            }));
            expect(jsonMock).toHaveBeenCalledWith({
                proposal: 'Professional proposal for Initech...',
            });
        });
        it('getClientHealth should calculate score, call Groq for summary, and cache score', async () => {
            mockReq.params = { clientId: 'client-1' };
            const mockClient = {
                id: 'client-1',
                name: 'Hooli',
                status: 'Contacted',
                updatedAt: new Date(),
                activityLogs: [{ createdAt: new Date() }],
                projects: [
                    {
                        status: 'In progress',
                        invoices: [{ status: 'Overdue' }],
                    },
                ],
            };
            prisma_1.default.client.findFirst.mockResolvedValue(mockClient);
            prisma_1.default.client.update.mockResolvedValue({});
            mockCreate.mockResolvedValue({
                choices: [{ message: { content: 'At risk — 1 overdue invoice.' } }],
            });
            await aiController.getClientHealth(mockReq, mockRes);
            expect(prisma_1.default.client.update).toHaveBeenCalledWith({
                where: { id: 'client-1' },
                data: { healthScore: '85' },
            });
            expect(jsonMock).toHaveBeenCalledWith({
                healthScore: 85,
                summary: 'At risk — 1 overdue invoice.',
            });
        });
    });
});
