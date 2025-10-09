import { Router } from 'express';
import {
    initiatePayment,
    getTransactionHistory,
    verifySwiftCode,
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    listPendingTransactions,
    verifyTransaction,
    submitToSwift
} from '../controllers/payment.controller';
import { validatePayment, validatePaymentMethod } from '../middleware/validation';
import { authenticateToken, requireEmployee } from '../middleware/auth';

const router = Router();

router.post('/international', authenticateToken, validatePayment, initiatePayment);
router.get('/history', authenticateToken, getTransactionHistory);
router.post('/verify-swift', authenticateToken, verifySwiftCode);
router.get('/methods', authenticateToken, getPaymentMethods);
router.post('/methods', authenticateToken, validatePaymentMethod, addPaymentMethod);
router.delete('/methods/:id', authenticateToken, deletePaymentMethod);

// Employee endpoints
router.get('/pending', authenticateToken, requireEmployee, listPendingTransactions);
router.post('/pending/:id/verify', authenticateToken, requireEmployee, verifyTransaction);
router.post('/pending/:id/submit', authenticateToken, requireEmployee, submitToSwift);

export default router;
