"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
const clients_routes_1 = __importDefault(require("./modules/clients/clients.routes"));
const projects_routes_1 = __importDefault(require("./modules/projects/projects.routes"));
const invoices_routes_1 = __importDefault(require("./modules/invoices/invoices.routes"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const notifications_routes_1 = __importDefault(require("./modules/notifications/notifications.routes"));
app.use('/api/clients', clients_routes_1.default);
app.use('/api/projects', projects_routes_1.default);
app.use('/api/invoices', invoices_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'FreelanceFlow API is running' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
