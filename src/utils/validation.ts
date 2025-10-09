// Regular expression patterns for input validation
export const VALIDATION_PATTERNS = {
    // Name: Letters, spaces, and hyphens only, 2-50 characters
    NAME_PATTERN: /^[A-Za-z\s-]{2,50}$/,
    
    // ID Number: Numeric only, exactly 13 digits (South African ID format)
    ID_NUMBER_PATTERN: /^\d{13}$/,
    
    // Account Number: 6-20 alphanumeric characters (supports formats like CUST001)
    ACCOUNT_NUMBER_PATTERN: /^[A-Za-z0-9]{6,20}$/,
    
    // Password: At least 8 chars, must contain uppercase, lowercase, number, and special char
    PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    
    // SWIFT Code: 8 or 11 characters, letters and numbers only
    SWIFT_CODE_PATTERN: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    
    // Amount: Positive number with up to 2 decimal places
    AMOUNT_PATTERN: /^\d+(\.\d{1,2})?$/
};

// Input sanitization function
export const sanitizeInput = (input: string): string => {
    return input.trim()
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Validation functions
export const validateName = (name: string): boolean => {
    return VALIDATION_PATTERNS.NAME_PATTERN.test(name);
};

export const validateIdNumber = (idNumber: string): boolean => {
    return VALIDATION_PATTERNS.ID_NUMBER_PATTERN.test(idNumber);
};

export const validateAccountNumber = (accountNumber: string): boolean => {
    return VALIDATION_PATTERNS.ACCOUNT_NUMBER_PATTERN.test(accountNumber);
};

export const validatePassword = (password: string): boolean => {
    return VALIDATION_PATTERNS.PASSWORD_PATTERN.test(password);
};

export const validateSwiftCode = (swiftCode: string): boolean => {
    return VALIDATION_PATTERNS.SWIFT_CODE_PATTERN.test(swiftCode);
};

export const validateAmount = (amount: string): boolean => {
    return VALIDATION_PATTERNS.AMOUNT_PATTERN.test(amount);
};
