import { Request, Response } from 'express';
import {
  getNotifications,
  markAsRead,
  sendNotification,
  checkOverdueInvoices,
} from './notifications.controller';
import prisma from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  },
}));

describe('Notifications Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      user: { id: 'user-123', email: 'user@example.com' },
      params: {},
      body: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
    };
  });

  describe('getNotifications', () => {
    it('returns 401 if user is not authenticated', async () => {
      mockReq.user = undefined;
      await getNotifications(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('fetches notifications ordered by createdAt desc', async () => {
      const mockNotifications = [
        { id: 'n1', title: 'Invoice Overdue', message: 'Due yesterday', isRead: false },
      ];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      await getNotifications(mockReq as Request, mockRes as Response);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(jsonMock).toHaveBeenCalledWith(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('returns 404 if notification does not exist or does not belong to user', async () => {
      mockReq.params = { id: 'n-unknown' };
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);

      await markAsRead(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Notification not found' });
    });

    it('marks notification as read', async () => {
      mockReq.params = { id: 'n-1' };
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue({ id: 'n-1', userId: 'user-123' });
      (prisma.notification.update as jest.Mock).mockResolvedValue({ id: 'n-1', isRead: true });

      await markAsRead(mockReq as Request, mockRes as Response);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n-1' },
        data: { isRead: true },
      });
      expect(jsonMock).toHaveBeenCalledWith({ id: 'n-1', isRead: true });
    });
  });

  describe('sendNotification', () => {
    it('returns 400 if title or message is missing', async () => {
      mockReq.body = { title: 'Test' };

      await sendNotification(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Title and message are required' });
    });

    it('creates notification and returns 201', async () => {
      mockReq.body = { title: 'Payment Received', message: 'Client paid $500' };
      const created = { id: 'n-2', ...mockReq.body, userId: 'user-123' };
      (prisma.notification.create as jest.Mock).mockResolvedValue(created);

      await sendNotification(mockReq as Request, mockRes as Response);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          title: 'Payment Received',
          message: 'Client paid $500',
        },
      });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, notification: created });
    });
  });

  describe('checkOverdueInvoices', () => {
    it('returns 401 if user is not authenticated', async () => {
      mockReq.user = undefined;
      await checkOverdueInvoices(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('finds unpaid invoices past due date, marks overdue and creates alert', async () => {
      const pastDate = new Date(Date.now() - 86400000);
      const mockOverdueInvoice = {
        id: 'inv-1',
        amount: 1500,
        status: 'Unpaid',
        dueDate: pastDate,
        project: {
          clientId: 'client-1',
          name: 'Website Redesign',
          client: {
            name: 'Acme Corp',
          },
        },
      };

      (prisma.invoice.findMany as jest.Mock).mockResolvedValue([mockOverdueInvoice]);
      (prisma.invoice.update as jest.Mock).mockResolvedValue({ ...mockOverdueInvoice, status: 'Overdue' });
      (prisma.notification.create as jest.Mock).mockResolvedValue({
        id: 'n-overdue-1',
        title: 'Overdue Invoice Alert: Acme Corp',
      });
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      await checkOverdueInvoices(mockReq as Request, mockRes as Response);

      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: 'Overdue' },
      });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          title: 'Overdue Invoice Alert: Acme Corp',
        }),
      });
      expect(prisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clientId: 'client-1',
          action: 'Invoice Overdue',
        }),
      });
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          checkedCount: 1,
        })
      );
    });
  });
});
