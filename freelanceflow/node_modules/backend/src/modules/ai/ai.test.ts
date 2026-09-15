import { Request, Response } from 'express';
import * as aiController from './ai.controller';
import prisma from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    client: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

describe('AI Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

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
    let spyGroq: jest.SpyInstance;

    beforeEach(() => {
      spyGroq = jest.spyOn(aiController, 'getGroqClient').mockReturnValue(null);
    });

    afterEach(() => {
      spyGroq.mockRestore();
    });

    it('generateProposal should return 503 with service unavailable error', async () => {
      mockReq.body = { clientId: 'client-1', projectScope: 'SEO', budget: 500, timeline: '1 week' };

      await aiController.generateProposal(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
    });

    it('getClientHealth should return 503 with service unavailable error', async () => {
      mockReq.params = { clientId: 'client-1' };

      await aiController.getClientHealth(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
    });
  });

  describe('When GROQ is available', () => {
    let mockCreate: jest.Mock;
    let spyGroq: jest.SpyInstance;

    beforeEach(() => {
      mockCreate = jest.fn();
      const mockGroqInstance = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      } as any;
      spyGroq = jest.spyOn(aiController, 'getGroqClient').mockReturnValue(mockGroqInstance);
    });

    afterEach(() => {
      spyGroq.mockRestore();
    });

    it('generateProposal should return 404 if client does not exist', async () => {
      mockReq.body = { clientId: 'client-unknown', projectScope: 'Web App', budget: 3000, timeline: '1 month' };
      (prisma.client.findFirst as jest.Mock).mockResolvedValue(null);

      await aiController.generateProposal(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Client not found' });
    });

    it('generateProposal should call Groq and return the proposal', async () => {
      mockReq.body = { clientId: 'client-1', projectScope: 'Web App', budget: 3000, timeline: '1 month' };
      (prisma.client.findFirst as jest.Mock).mockResolvedValue({ id: 'client-1', name: 'Initech' });
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Professional proposal for Initech...' } }],
      });

      await aiController.generateProposal(mockReq as Request, mockRes as Response);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: expect.stringContaining('Initech') }),
          ]),
        })
      );
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

      (prisma.client.findFirst as jest.Mock).mockResolvedValue(mockClient);
      (prisma.client.update as jest.Mock).mockResolvedValue({});
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'At risk — 1 overdue invoice.' } }],
      });

      await aiController.getClientHealth(mockReq as Request, mockRes as Response);

      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: { healthScore: '85' },
      });
      expect(jsonMock).toHaveBeenCalledWith({
        healthScore: 85,
        summary: 'At risk — 1 overdue invoice.',
      });
    });
  });

  describe('sendProposal (Resend Email Dispatch)', () => {
    const originalEnv = process.env;
    const originalFetch = global.fetch;

    beforeEach(() => {
      process.env = { ...originalEnv, RESEND_API_KEY: 'test-resend-key' };
    });

    afterEach(() => {
      process.env = originalEnv;
      global.fetch = originalFetch;
    });

    it('should return 400 if any required field is missing', async () => {
      mockReq.body = { clientId: 'client-1', recipientEmail: 'test@example.com' }; // missing subject & proposalContent

      await aiController.sendProposal(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Missing required fields') })
      );
    });

    it('should return 404 if client not found for user', async () => {
      mockReq.body = {
        clientId: 'client-999',
        recipientEmail: 'client@example.com',
        subject: 'Proposal',
        proposalContent: 'Hello',
      };
      (prisma.client.findFirst as jest.Mock).mockResolvedValue(null);

      await aiController.sendProposal(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Client not found' });
    });

    it('should return 503 if RESEND_API_KEY is not configured', async () => {
      delete process.env.RESEND_API_KEY;
      mockReq.body = {
        clientId: 'client-1',
        recipientEmail: 'client@example.com',
        subject: 'Proposal',
        proposalContent: 'Hello',
      };
      (prisma.client.findFirst as jest.Mock).mockResolvedValue({ id: 'client-1', name: 'Acme Corp' });

      await aiController.sendProposal(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Missing RESEND_API_KEY') })
      );
    });

    it('should return error if Resend API rejects the request', async () => {
      mockReq.body = {
        clientId: 'client-1',
        recipientEmail: 'unverified@example.com',
        subject: 'Proposal',
        proposalContent: 'Drafted proposal content',
      };
      (prisma.client.findFirst as jest.Mock).mockResolvedValue({ id: 'client-1', name: 'Acme Corp' });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: jest.fn().mockResolvedValue({ message: 'Domain verification required' }),
      } as any);

      await aiController.sendProposal(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Domain verification required' })
      );
    });

    it('should send email, update client status, log activity, and return success', async () => {
      mockReq.body = {
        clientId: 'client-1',
        recipientEmail: 'client@example.com',
        subject: 'Website Redesign Proposal',
        proposalContent: 'Complete proposal details...',
      };
      (prisma.client.findFirst as jest.Mock).mockResolvedValue({ id: 'client-1', name: 'Acme Corp' });
      (prisma.client.update as jest.Mock).mockResolvedValue({ id: 'client-1', name: 'Acme Corp', status: 'Proposal Sent' });
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ id: 'resend-email-123' }),
      } as any);

      await aiController.sendProposal(mockReq as Request, mockRes as Response);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-resend-key',
          }),
          body: expect.stringContaining('client@example.com'),
        })
      );

      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 'client-1' },
        data: { status: 'Proposal Sent' },
      });

      expect(prisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: 'client-1',
          action: 'Proposal Sent',
        }),
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          title: expect.stringContaining('Acme Corp'),
        }),
      });

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          emailId: 'resend-email-123',
        })
      );
    });
  });
});

