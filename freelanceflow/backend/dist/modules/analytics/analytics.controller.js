"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        // Revenue calculations
        const invoices = await prisma_1.default.invoice.findMany({
            where: { project: { client: { userId } } }
        });
        let totalRevenue = 0;
        let outstandingRevenue = 0;
        const revenueByMonth = {};
        invoices.forEach(inv => {
            const month = new Date(inv.createdAt).toLocaleString('default', { month: 'short' });
            if (!revenueByMonth[month])
                revenueByMonth[month] = 0;
            if (inv.status === 'Paid') {
                totalRevenue += inv.amount;
                revenueByMonth[month] += inv.amount;
            }
            else {
                outstandingRevenue += inv.amount;
            }
        });
        const chartData = Object.entries(revenueByMonth).map(([name, total]) => ({ name, total }));
        // At-risk clients (health score < 50 or has overdue invoices)
        const atRiskClients = await prisma_1.default.client.findMany({
            where: {
                userId,
                OR: [
                    { healthScore: { lte: '50' } },
                    { projects: { some: { invoices: { some: { status: 'Overdue' } } } } }
                ]
            },
            include: {
                projects: {
                    include: { invoices: true }
                }
            },
            take: 5
        });
        res.json({
            metrics: {
                totalRevenue,
                outstandingRevenue,
            },
            chartData: chartData.length > 0 ? chartData : [{ name: 'Current', total: totalRevenue }],
            atRiskClients
        });
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
