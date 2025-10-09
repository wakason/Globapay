"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentMethod = exports.addPaymentMethod = exports.getPaymentMethods = exports.verifySwiftCode = exports.getTransactionHistory = exports.submitToSwift = exports.verifyTransaction = exports.listPendingTransactions = exports.initiatePayment = void 0;
const database_1 = require("../config/database");
const Transaction_1 = require("../models/Transaction");
const PaymentMethod_1 = require("../models/PaymentMethod");
const swift_service_1 = require("../services/swift.service");
const AuditLog_1 = require("../models/AuditLog");
const initiatePayment = async (req, res) => {
    const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
    try {
        const { amount, currency, recipientName, recipientAccount, swiftCode } = req.body;
        // Verify SWIFT code format/validity upfront only
        const swiftService = new swift_service_1.SwiftService();
        const isValidSwift = await swiftService.verifySwiftCode(swiftCode);
        if (!isValidSwift) {
            return res.status(400).json({ success: false, message: 'Invalid SWIFT code' });
        }
        // Create transaction
        const transaction = new Transaction_1.Transaction();
        transaction.user = req.user;
        transaction.amount = amount;
        transaction.currency = currency;
        transaction.recipientName = recipientName;
        transaction.recipientAccount = recipientAccount;
        transaction.swiftCode = swiftCode;
        transaction.type = Transaction_1.TransactionType.SWIFT;
        transaction.status = Transaction_1.TransactionStatus.PENDING;
        // Do NOT submit to SWIFT here. Store as pending for employee verification.
        await transactionRepository.save(transaction);
        res.json({
            success: true,
            message: 'Payment created and pending employee verification',
            transaction: {
                id: transaction.id,
                status: transaction.status,
                reference: transaction.reference
            }
        });
    }
    catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment creation failed'
        });
    }
};
exports.initiatePayment = initiatePayment;
const listPendingTransactions = async (req, res) => {
    const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
    try {
        const transactions = await transactionRepository.find({
            where: { status: Transaction_1.TransactionStatus.PENDING },
            order: { createdAt: 'ASC' }
        });
        res.json({ success: true, transactions });
    }
    catch (error) {
        console.error('List pending error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending transactions' });
    }
};
exports.listPendingTransactions = listPendingTransactions;
const verifyTransaction = async (req, res) => {
    var _a, _b;
    const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
    try {
        const { id } = req.params;
        const tx = await transactionRepository.findOne({ where: { id } });
        if (!tx)
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        if (tx.status !== Transaction_1.TransactionStatus.PENDING)
            return res.status(400).json({ success: false, message: 'Only pending transactions can be verified' });
        // Here employees verify recipient info and swift code correctness externally (assumed done by UI)
        // Mark as verified via metadata flag
        tx.metadata = { ...(tx.metadata || {}), employeeVerified: true, verifiedAt: new Date().toISOString(), verifiedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id };
        await transactionRepository.save(tx);
        // audit
        const auditRepo = database_1.AppDataSource.getRepository(AuditLog_1.AuditLog);
        await auditRepo.save({ actorUserId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id, action: 'verify_transaction', transactionId: tx.id, details: { verified: true } });
        res.json({ success: true, message: 'Transaction verified' });
    }
    catch (error) {
        console.error('Verify transaction error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};
exports.verifyTransaction = verifyTransaction;
const submitToSwift = async (req, res) => {
    var _a, _b, _c;
    const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
    try {
        const { id } = req.params;
        const tx = await transactionRepository.findOne({ where: { id } });
        if (!tx)
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        if (tx.status !== Transaction_1.TransactionStatus.PENDING)
            return res.status(400).json({ success: false, message: 'Only pending transactions can be submitted' });
        const swiftService = new swift_service_1.SwiftService();
        try {
            const swiftResult = await swiftService.processPayment({
                amount: tx.amount,
                currency: tx.currency,
                recipientName: tx.recipientName,
                recipientAccount: tx.recipientAccount,
                swiftCode: tx.swiftCode
            });
            tx.reference = swiftResult.reference;
            tx.status = Transaction_1.TransactionStatus.COMPLETED;
            tx.metadata = { ...(tx.metadata || {}), swift: swiftResult, submittedAt: new Date().toISOString(), submittedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id };
            await transactionRepository.save(tx);
            const auditRepo = database_1.AppDataSource.getRepository(AuditLog_1.AuditLog);
            await auditRepo.save({ actorUserId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id, action: 'submit_to_swift', transactionId: tx.id, details: { reference: tx.reference } });
            res.json({ success: true, message: 'Submitted to SWIFT', reference: tx.reference });
        }
        catch (error) {
            tx.status = Transaction_1.TransactionStatus.FAILED;
            tx.errorMessage = error.message;
            await transactionRepository.save(tx);
            const auditRepo = database_1.AppDataSource.getRepository(AuditLog_1.AuditLog);
            await auditRepo.save({ actorUserId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id, action: 'submit_to_swift_failed', transactionId: tx.id, details: { error: tx.errorMessage } });
            res.status(502).json({ success: false, message: 'SWIFT submission failed' });
        }
    }
    catch (error) {
        console.error('Submit to SWIFT error:', error);
        res.status(500).json({ success: false, message: 'Submission failed' });
    }
};
exports.submitToSwift = submitToSwift;
const getTransactionHistory = async (req, res) => {
    const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
    try {
        const transactions = await transactionRepository.find({
            where: { user: { id: req.user.id } },
            order: { createdAt: 'DESC' }
        });
        res.json({
            success: true,
            transactions
        });
    }
    catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history'
        });
    }
};
exports.getTransactionHistory = getTransactionHistory;
const verifySwiftCode = async (req, res) => {
    try {
        const { swiftCode } = req.body;
        const swiftService = new swift_service_1.SwiftService();
        const isValid = await swiftService.verifySwiftCode(swiftCode);
        res.json({
            success: true,
            isValid
        });
    }
    catch (error) {
        console.error('SWIFT verification error:', error);
        res.status(500).json({
            success: false,
            message: 'SWIFT code verification failed'
        });
    }
};
exports.verifySwiftCode = verifySwiftCode;
const getPaymentMethods = async (req, res) => {
    const paymentMethodRepository = database_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod);
    try {
        const paymentMethods = await paymentMethodRepository.find({
            where: {
                user: { id: req.user.id },
                isActive: true
            }
        });
        res.json({
            success: true,
            paymentMethods
        });
    }
    catch (error) {
        console.error('Payment methods fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment methods'
        });
    }
};
exports.getPaymentMethods = getPaymentMethods;
const addPaymentMethod = async (req, res) => {
    const paymentMethodRepository = database_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod);
    try {
        const { type, accountNumber, swiftCode, bankName, bankAddress } = req.body;
        const paymentMethod = new PaymentMethod_1.PaymentMethod();
        paymentMethod.user = req.user;
        paymentMethod.type = type;
        paymentMethod.accountNumber = accountNumber;
        paymentMethod.swiftCode = swiftCode;
        paymentMethod.bankName = bankName;
        paymentMethod.bankAddress = bankAddress;
        await paymentMethodRepository.save(paymentMethod);
        res.status(201).json({
            success: true,
            message: 'Payment method added successfully',
            paymentMethod: {
                id: paymentMethod.id,
                type: paymentMethod.type,
                accountNumber: paymentMethod.accountNumber
            }
        });
    }
    catch (error) {
        console.error('Payment method creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add payment method'
        });
    }
};
exports.addPaymentMethod = addPaymentMethod;
const deletePaymentMethod = async (req, res) => {
    var _a;
    const paymentMethodRepository = database_1.AppDataSource.getRepository(PaymentMethod_1.PaymentMethod);
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Payment method id is required' });
        }
        const method = await paymentMethodRepository.findOne({ where: { id }, relations: { user: true } });
        if (!method || !method.user || method.user.id !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }
        // Soft delete: mark inactive, preserve history
        method.isActive = false;
        await paymentMethodRepository.save(method);
        return res.json({ success: true, message: 'Payment method deleted' });
    }
    catch (error) {
        console.error('Payment method delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete payment method' });
    }
};
exports.deletePaymentMethod = deletePaymentMethod;
