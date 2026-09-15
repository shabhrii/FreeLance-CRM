import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const invoices = await prisma.invoice.findMany({
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
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { projectId: inputProjectId, clientId, projectName, amount, dueDate, lineItems } = req.body;
    const userId = req.user?.id;

    if (amount === undefined || !dueDate) {
      res.status(400).json({ error: 'Amount and due date are required' });
      return;
    }

    if (!inputProjectId && !clientId) {
      res.status(400).json({ error: 'Either project or client must be selected' });
      return;
    }

    let finalProjectId = inputProjectId;

    // If client is specified directly, find or create a project for them
    if (!finalProjectId && clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId }
      });
      if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      // Check if client already has a project or create a new one
      const existingProject = await prisma.project.findFirst({
        where: { clientId }
      });

      if (existingProject && !projectName) {
        finalProjectId = existingProject.id;
      } else {
        const newProject = await prisma.project.create({
          data: {
            clientId,
            name: projectName || `${client.name} Project`,
            status: 'In progress',
          }
        });
        finalProjectId = newProject.id;
      }
    }

    const project = await prisma.project.findFirst({
      where: { id: finalProjectId, client: { userId } },
      include: { client: true }
    });
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    const invoice = await prisma.invoice.create({
      data: {
        projectId: finalProjectId,
        amount: parsedAmount,
        dueDate: new Date(dueDate),
        status: 'Unpaid',
        lineItems: {
          create: lineItems || [
            { description: 'Professional Services', quantity: 1, price: parsedAmount }
          ]
        }
      },
      include: { lineItems: true, project: { include: { client: true } } }
    });

    // Log activity on the client
    await prisma.activityLog.create({
      data: {
        clientId: project.clientId,
        action: 'Invoice Created',
        details: `Created invoice for $${parsedAmount.toFixed(2)}`
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const { status } = req.body; // Unpaid, Paid, Overdue
    
    const existing = await prisma.invoice.findFirst({
      where: { id, project: { client: { userId } } }
    });
    
    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status }
    });
    
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    
    const existing = await prisma.invoice.findFirst({
      where: { id, project: { client: { userId } } }
    });
    
    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
    await prisma.invoice.delete({ where: { id } });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
