import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import Groq from 'groq-sdk';

export const getGroqClient = () => {
  return process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
};

export const generateProposal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { clientId, projectScope, budget, timeline } = req.body;

    const groq = getGroqClient();
    if (!groq) {
      res.status(503).json({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
      return;
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId }
    });

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const prompt = `Draft a professional business proposal for the following client.
Client Name: ${client.name}
Scope of Work: ${projectScope}
Estimated Budget: $${budget}
Timeline: ${timeline}

Keep it concise, professional, and structured with an introduction, scope, timeline, and pricing section.`;

    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
    });

    const proposal = chatCompletion.choices[0]?.message?.content || '';

    res.json({ proposal });
  } catch (error) {
    console.error('Error generating proposal:', error);
    res.status(500).json({ error: 'Failed to generate proposal. Please try again later.' });
  }
};

export const getClientHealth = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const clientId = req.params.clientId as string;

    const groq = getGroqClient();
    if (!groq) {
      res.status(503).json({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
      return;
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
      include: {
        projects: {
          include: { invoices: true }
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const now = new Date();
    const lastContact = client.activityLogs[0]?.createdAt || client.updatedAt;
    const daysSinceContact = Math.floor((now.getTime() - new Date(lastContact).getTime()) / (1000 * 3600 * 24));
    
    let overdueInvoices = 0;
    let openProjects = 0;
    
    client.projects.forEach(p => {
      if (p.status !== 'Completed') openProjects++;
      p.invoices.forEach(i => {
        if (i.status === 'Overdue') overdueInvoices++;
      });
    });

    // Simple rule-based score 0-100
    let healthScore = 100;
    if (daysSinceContact > 14) healthScore -= 20;
    if (daysSinceContact > 30) healthScore -= 20;
    if (overdueInvoices > 0) healthScore -= (overdueInvoices * 15);
    if (client.status === 'Lost') healthScore = 0;

    // Constrain score
    healthScore = Math.max(0, Math.min(100, healthScore));

    const prompt = `Based on the following data for client "${client.name}", write a single-sentence human-readable summary of their account health.
Days since last contact: ${daysSinceContact}
Open projects: ${openProjects}
Overdue invoices: ${overdueInvoices}
Current pipeline status: ${client.status}
Calculated health score: ${healthScore}/100

Example format: "At risk — no contact in 18 days, one overdue invoice." or "Healthy — active projects and no overdue invoices."`;

    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
    });

    const summary = chatCompletion.choices[0]?.message?.content || 'Health summary unavailable.';

    // Cache the health score
    await prisma.client.update({
      where: { id: clientId },
      data: { healthScore: String(healthScore) }
    });

    res.json({ healthScore, summary: summary.trim() });
  } catch (error) {
    console.error('Error fetching client health:', error);
    res.status(500).json({ error: 'Failed to evaluate client health' });
  }
};

export const formatProposalHtml = (clientName: string, subject: string, proposalContent: string): string => {
  const paragraphs = proposalContent
    .split('\n\n')
    .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.65; color: #334155;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background: #0f172a; color: #ffffff; padding: 28px 32px;">
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; color: #ffffff;">FreelanceFlow Proposal</h1>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">Prepared exclusively for ${clientName}</p>
    </div>
    <div style="padding: 32px 32px 24px 32px; font-size: 15px;">
      ${paragraphs}
    </div>
    <div style="background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0;">Sent via <strong>FreelanceFlow CRM</strong> • Delivered by Resend</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

export const sendProposal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { clientId, recipientEmail, subject, proposalContent } = req.body;

    if (!clientId || !recipientEmail || !subject || !proposalContent) {
      res.status(400).json({ error: 'Missing required fields: clientId, recipientEmail, subject, and proposalContent are required.' });
      return;
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId }
    });

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: 'Email service unavailable: Missing RESEND_API_KEY' });
      return;
    }

    const html = formatProposalHtml(client.name, subject, proposalContent);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FreelanceFlow <onboarding@resend.dev>',
        to: [recipientEmail],
        subject,
        html,
        text: proposalContent,
      }),
    });

    const resendData: any = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[Resend Error]:', resendData);
      res.status(resendResponse.status || 500).json({
        error: resendData.message || 'Failed to dispatch email via Resend',
        details: resendData
      });
      return;
    }

    // Update Client status to "Proposal Sent"
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: { status: 'Proposal Sent' }
    });

    // Create ActivityLog entry
    await prisma.activityLog.create({
      data: {
        clientId,
        action: 'Proposal Sent',
        details: `Proposal sent via Resend to ${recipientEmail} with subject "${subject}"`
      }
    });

    // Create in-app Notification for user
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: `Proposal Sent: ${client.name}`,
          message: `Emailed proposal "${subject}" to ${recipientEmail}`
        }
      });
    }

    res.json({
      success: true,
      emailId: resendData.id,
      client: updatedClient,
      message: `Proposal successfully sent to ${recipientEmail}!`
    });
  } catch (error) {
    console.error('Error sending proposal:', error);
    res.status(500).json({ error: 'Failed to send proposal email' });
  }
};

