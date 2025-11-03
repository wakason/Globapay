import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation chains
export const validateRegistration = [
    body('username')
        .trim()
        .escape()
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage('Username must be 3-30 chars, alphanumeric plus _ . - allowed'),
    body('fullName')
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    body('accountNumber')
        .trim()
        .matches(/^\d{10,20}$/)
        .withMessage('Invalid account number format'),
    body('idNumber')
        .trim()
        .matches(/^\d{13}$/)
        .withMessage('Invalid ID number format'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least 8 characters, including uppercase, lowercase, number and special character'),
    body('role')
        .optional()
        .isIn(['customer','employee'])
        .withMessage('Invalid role'),
    validateResults
];

export const validateLogin = [
    body('username')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validateResults
];

export const validatePayment = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom(value => value > 0)
        .withMessage('Amount must be greater than 0'),
    body('currency')
        .isIn(['USD', 'EUR', 'GBP', 'ZAR'])
        .withMessage('Invalid currency'),
    body('recipientName')
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage('Recipient name must be between 2 and 50 characters'),
    body('recipientAccount')
        .trim()
        .matches(/^\d{6,20}$/)
        .withMessage('Invalid recipient account number'),
    body('swiftCode')
        .trim()
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
        .withMessage('Invalid SWIFT code'),
    validateResults
];

export const validatePaymentMethod = [
    body('type')
        .isIn(['swift', 'sepa', 'ach'])
        .withMessage('Invalid payment method type'),
    body('accountNumber')
        .trim()
        .matches(/^\d{10,20}$/)
        .withMessage('Invalid account number'),
    body('swiftCode')
        .optional()
        .trim()
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
        .withMessage('Invalid SWIFT code'),
    validateResults
];

// Validation results handler
function validateResults(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
}
