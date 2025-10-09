"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentMethod = exports.validatePayment = exports.validateLogin = exports.validateRegistration = void 0;
const express_validator_1 = require("express-validator");
// Validation chains
exports.validateRegistration = [
    (0, express_validator_1.body)('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage('Username must be 3-30 chars, alphanumeric plus _ . - allowed'),
    (0, express_validator_1.body)('fullName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('accountNumber')
        .trim()
        .matches(/^\d{10,20}$/)
        .withMessage('Invalid account number format'),
    (0, express_validator_1.body)('idNumber')
        .trim()
        .matches(/^\d{13}$/)
        .withMessage('Invalid ID number format'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least 8 characters, including uppercase, lowercase, number and special character'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['customer', 'employee'])
        .withMessage('Invalid role'),
    validateResults
];
exports.validateLogin = [
    (0, express_validator_1.body)('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    validateResults
];
exports.validatePayment = [
    (0, express_validator_1.body)('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom(value => value > 0)
        .withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('currency')
        .isIn(['USD', 'EUR', 'GBP', 'ZAR'])
        .withMessage('Invalid currency'),
    (0, express_validator_1.body)('recipientName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Recipient name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('recipientAccount')
        .trim()
        .matches(/^\d{6,20}$/)
        .withMessage('Invalid recipient account number'),
    (0, express_validator_1.body)('swiftCode')
        .trim()
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
        .withMessage('Invalid SWIFT code'),
    validateResults
];
exports.validatePaymentMethod = [
    (0, express_validator_1.body)('type')
        .isIn(['swift', 'sepa', 'ach'])
        .withMessage('Invalid payment method type'),
    (0, express_validator_1.body)('accountNumber')
        .trim()
        .matches(/^\d{10,20}$/)
        .withMessage('Invalid account number'),
    (0, express_validator_1.body)('swiftCode')
        .optional()
        .trim()
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
        .withMessage('Invalid SWIFT code'),
    validateResults
];
// Validation results handler
function validateResults(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
}
