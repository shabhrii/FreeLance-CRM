import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getClients = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // Auto-create user if not exists for demo purposes since we trust the JWT
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: req.user.email || 'unknown@example.com' }
    });

    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    
    const client = await prisma.client.findFirst({
      where: { id, userId }
    });
    
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createClient = async (req: Request, res: Response) => {
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
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: req.user.email || 'unknown@example.com' }
    });

    const client = await prisma.client.create({
      data: {
        userId,
        name,
        email,
        phone,
        status: status || 'New',
      }
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        clientId: client.id,
        action: 'Created Lead/Client',
      }
    });
    
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const { name, email, phone, status } = req.body;
    
    // Verify ownership
    const existing = await prisma.client.findFirst({ where: { id, userId }});
    if (!existing) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    
    const client = await prisma.client.update({
      where: { id },
      data: { name, email, phone, status }
    });
    
    if (existing.status !== status) {
      await prisma.activityLog.create({
        data: {
          clientId: client.id,
          action: 'Stage Changed',
          details: `Changed from ${existing.status} to ${status}`
        }
      });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    
    // Verify ownership
    const existing = await prisma.client.findFirst({ where: { id, userId }});
    if (!existing) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    
    await prisma.activityLog.deleteMany({ where: { clientId: id } });
    await prisma.client.delete({ where: { id } });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
