"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientHealth = exports.generateProposal = exports.getGroqClient = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const getGroqClient = () => {
    return process.env.GROQ_API_KEY ? new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY }) : null;
};
exports.getGroqClient = getGroqClient;
const generateProposal = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { clientId, projectScope, budget, timeline } = req.body;
        const groq = (0, exports.getGroqClient)();
        if (!groq) {
            res.status(503).json({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
            return;
        }
        const client = await prisma_1.default.client.findFirst({
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
    }
    catch (error) {
        console.error('Error generating proposal:', error);
        res.status(500).json({ error: 'Failed to generate proposal. Please try again later.' });
    }
};
exports.generateProposal = generateProposal;
const getClientHealth = async (req, res) => {
    try {
        const userId = req.user?.id;
        const clientId = req.params.clientId;
        const groq = (0, exports.getGroqClient)();
        if (!groq) {
            res.status(503).json({ error: 'AI service unavailable: Missing GROQ_API_KEY' });
            return;
        }
        const client = await prisma_1.default.client.findFirst({
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
            if (p.status !== 'Completed')
                openProjects++;
            p.invoices.forEach(i => {
                if (i.status === 'Overdue')
                    overdueInvoices++;
            });
        });
        // Simple rule-based score 0-100
        let healthScore = 100;
        if (daysSinceContact > 14)
            healthScore -= 20;
        if (daysSinceContact > 30)
            healthScore -= 20;
        if (overdueInvoices > 0)
            healthScore -= (overdueInvoices * 15);
        if (client.status === 'Lost')
            healthScore = 0;
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
        await prisma_1.default.client.update({
            where: { id: clientId },
            data: { healthScore: String(healthScore) }
        });
        res.json({ healthScore, summary: summary.trim() });
    }
    catch (error) {
        console.error('Error fetching client health:', error);
        res.status(500).json({ error: 'Failed to evaluate client health' });
    }
};
exports.getClientHealth = getClientHealth;
