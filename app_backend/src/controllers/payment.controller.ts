import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction, TransactionStatus, TransactionType } from '../models/Transaction';
import { PaymentMethod } from '../models/PaymentMethod';
import { SwiftService } from '../services/swift.service';
import { AuditLog } from '../models/AuditLog';

interface AuthRequest extends Request {
    user?: any;
}

export const initiatePayment = async (req: AuthRequest, res: Response) => {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    
    try {
        const {
            amount,
            currency,
            recipientName,
            recipientAccount,
            swiftCode
        } = req.body;

        // Verify SWIFT code format/validity upfront only
        const swiftService = new SwiftService();
        const isValidSwift = await swiftService.verifySwiftCode(swiftCode);
        if (!isValidSwift) {
            return res.status(400).json({ success: false, message: 'Invalid SWIFT code' });
        }

        // Create transaction
        const transaction = new Transaction();
        transaction.user = req.user;
        transaction.amount = amount;
        transaction.currency = currency;
        transaction.recipientName = recipientName;
        transaction.recipientAccount = recipientAccount;
        transaction.swiftCode = swiftCode;
        transaction.type = TransactionType.SWIFT;
        transaction.status = TransactionStatus.PENDING;

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
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment creation failed'
        });
    }
};

export const listPendingTransactions = async (req: AuthRequest, res: Response) => {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    try {
        const transactions = await transactionRepository.find({
            where: { status: TransactionStatus.PENDING },
            order: { createdAt: 'ASC' }
        });
        res.json({ success: true, transactions });
    } catch (error) {
        console.error('List pending error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending transactions' });
    }
};

export const verifyTransaction = async (req: AuthRequest, res: Response) => {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    try {
        const { id } = req.params as any;
        const tx = await transactionRepository.findOne({ where: { id } });
        if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
        if (tx.status !== TransactionStatus.PENDING) return res.status(400).json({ success: false, message: 'Only pending transactions can be verified' });
        // Here employees verify recipient info and swift code correctness externally (assumed done by UI)
        // Mark as verified via metadata flag
        tx.metadata = { ...(tx.metadata || {}), employeeVerified: true, verifiedAt: new Date().toISOString(), verifiedBy: req.user?.id };
        await transactionRepository.save(tx);
        // audit
        const auditRepo = AppDataSource.getRepository(AuditLog);
        await auditRepo.save({ actorUserId: req.user?.id, action: 'verify_transaction', transactionId: tx.id, details: { verified: true } });
        res.json({ success: true, message: 'Transaction verified' });
    } catch (error) {
        console.error('Verify transaction error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};

export const submitToSwift = async (req: AuthRequest, res: Response) => {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    try {
        const { id } = req.params as any;
        const tx = await transactionRepository.findOne({ where: { id } });
        if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
        if (tx.status !== TransactionStatus.PENDING) return res.status(400).json({ success: false, message: 'Only pending transactions can be submitted' });
        const swiftService = new SwiftService();
        try {
            const swiftResult = await swiftService.processPayment({
                amount: tx.amount,
                currency: tx.currency,
                recipientName: tx.recipientName,
                recipientAccount: tx.recipientAccount,
                swiftCode: tx.swiftCode
            });
            tx.reference = swiftResult.reference;
            tx.status = TransactionStatus.COMPLETED;
            tx.metadata = { ...(tx.metadata || {}), swift: swiftResult, submittedAt: new Date().toISOString(), submittedBy: req.user?.id };
            await transactionRepository.save(tx);
            const auditRepo = AppDataSource.getRepository(AuditLog);
            await auditRepo.save({ actorUserId: req.user?.id, action: 'submit_to_swift', transactionId: tx.id, details: { reference: tx.reference } });
            res.json({ success: true, message: 'Submitted to SWIFT', reference: tx.reference });
        } catch (error: any) {
            tx.status = TransactionStatus.FAILED;
            tx.errorMessage = error.message;
            await transactionRepository.save(tx);
            const auditRepo = AppDataSource.getRepository(AuditLog);
            await auditRepo.save({ actorUserId: req.user?.id, action: 'submit_to_swift_failed', transactionId: tx.id, details: { error: tx.errorMessage } });
            res.status(502).json({ success: false, message: 'SWIFT submission failed' });
        }
    } catch (error) {
        console.error('Submit to SWIFT error:', error);
        res.status(500).json({ success: false, message: 'Submission failed' });
    }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    
    try {
        const transactions = await transactionRepository.find({
            where: { user: { id: req.user.id } },
            order: { createdAt: 'DESC' }
        });

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history'
        });
    }
};

export const verifySwiftCode = async (req: Request, res: Response) => {
    try {
        const { swiftCode } = req.body;
        const swiftService = new SwiftService();
        const isValid = await swiftService.verifySwiftCode(swiftCode);

        res.json({
            success: true,
            isValid
        });
    } catch (error) {
        console.error('SWIFT verification error:', error);
        res.status(500).json({
            success: false,
            message: 'SWIFT code verification failed'
        });
    }
};

export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
    const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);
    
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
    } catch (error) {
        console.error('Payment methods fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment methods'
        });
    }
};

export const addPaymentMethod = async (req: AuthRequest, res: Response) => {
    const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);
    
    try {
        const { type, accountNumber, swiftCode, bankName, bankAddress } = req.body;

        const paymentMethod = new PaymentMethod();
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
    } catch (error) {
        console.error('Payment method creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add payment method'
        });
    }
};

export const deletePaymentMethod = async (req: AuthRequest, res: Response) => {
    const paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);
    try {
        const { id } = req.params as any;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Payment method id is required' });
        }

        const method = await paymentMethodRepository.findOne({ where: { id } , relations: { user: true } });
        if (!method || !method.user || method.user.id !== req.user?.id) {
            return res.status(404).json({ success: false, message: 'Payment method not found' });
        }

        // Soft delete: mark inactive, preserve history
        method.isActive = false;
        await paymentMethodRepository.save(method);

        return res.json({ success: true, message: 'Payment method deleted' });
    } catch (error) {
        console.error('Payment method delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete payment method' });
    }
};
