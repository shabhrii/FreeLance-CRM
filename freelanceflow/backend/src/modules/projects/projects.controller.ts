import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // We only want projects for clients owned by the user
    const projects = await prisma.project.findMany({
      where: {
        client: { userId }
      },
      include: {
        client: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { clientId, name, status, startDate, dueDate } = req.body;
    const userId = req.user?.id;

    if (!clientId || !name) {
      res.status(400).json({ error: 'Client ID and name are required' });
      return;
    }

    // Verify client belongs to user
    const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        clientId,
        name,
        status: status || 'Not started',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { client: true }
    });
    
    await prisma.activityLog.create({
      data: {
        clientId,
        action: 'Created Project',
        details: `Project "${name}" created.`
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    const { name, status, startDate, dueDate } = req.body;
    
    const existing = await prisma.project.findFirst({
      where: { id, client: { userId } }
    });
    
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    const project = await prisma.project.update({
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
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;
    
    const existing = await prisma.project.findFirst({
      where: { id, client: { userId } }
    });
    
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    // Check if invoices exist
    const invoicesCount = await prisma.invoice.count({ where: { projectId: id } });
    if (invoicesCount > 0) {
      res.status(400).json({ error: 'Cannot delete project with existing invoices' });
      return;
    }
    
    await prisma.project.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
