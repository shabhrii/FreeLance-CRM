"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clients_controller_1 = require("./clients.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.requireAuth);
router.get('/', clients_controller_1.getClients);
router.get('/:id', clients_controller_1.getClient);
router.post('/', clients_controller_1.createClient);
router.put('/:id', clients_controller_1.updateClient);
router.delete('/:id', clients_controller_1.deleteClient);
exports.default = router;
