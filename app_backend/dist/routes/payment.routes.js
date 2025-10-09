"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/international', auth_1.authenticateToken, validation_1.validatePayment, payment_controller_1.initiatePayment);
router.get('/history', auth_1.authenticateToken, payment_controller_1.getTransactionHistory);
router.post('/verify-swift', auth_1.authenticateToken, payment_controller_1.verifySwiftCode);
router.get('/methods', auth_1.authenticateToken, payment_controller_1.getPaymentMethods);
router.post('/methods', auth_1.authenticateToken, validation_1.validatePaymentMethod, payment_controller_1.addPaymentMethod);
router.delete('/methods/:id', auth_1.authenticateToken, payment_controller_1.deletePaymentMethod);
// Employee endpoints
router.get('/pending', auth_1.authenticateToken, auth_1.requireEmployee, payment_controller_1.listPendingTransactions);
router.post('/pending/:id/verify', auth_1.authenticateToken, auth_1.requireEmployee, payment_controller_1.verifyTransaction);
router.post('/pending/:id/submit', auth_1.authenticateToken, auth_1.requireEmployee, payment_controller_1.submitToSwift);
exports.default = router;
