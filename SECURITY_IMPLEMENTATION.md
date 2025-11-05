# GloBaPay Security Implementation Report

**Course**: Application Development Security (APDS7311)  
**Institution**: The Independent Institute of Education  
**Project**: International Payment Portal System

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Password Security Implementation](#password-security-implementation)
3. [Input Whitelisting and Validation](#input-whitelisting-and-validation)
4. [SSL/TLS Implementation](#ssltls-implementation)
5. [Attack Protection Measures](#attack-protection-measures)
6. [DevSecOps Pipeline](#devsecops-pipeline)
7. [Employee Portal Security](#employee-portal-security)

---

## Executive Summary

This document details the comprehensive security implementation for the GloBaPay International Payment Portal, covering both customer and employee portals. The system implements industry-standard security practices to protect sensitive financial data and prevent common web application vulnerabilities.

## 1. Password Security Implementation

### 1.1 Hashing and Salting

**Implementation Location**: `app_backend/src/models/User.ts`

The system implements password security using **bcrypt** with both salting and peppering:

```typescript
async hashPassword(): Promise<void> {
    if (this.password) {
        const salt = await bcrypt.genSalt(getBcryptCost());
        const peppered = `${this.password}${getPepper()}`;
        this.password = await bcrypt.hash(peppered, salt);
    }
}
```

### 1.2 Security Features

- **Bcrypt Cost Factor**: Configurable via environment variable `BCRYPT_COST` (default: 12)
  - Range: 10-15 to balance security and performance
  - Higher cost = stronger protection against brute force attacks

- **Salt Generation**: Unique salt per password using `bcrypt.genSalt()`
  - Prevents rainbow table attacks
  - Makes parallel attacks on multiple passwords infeasible

- **Server-Side Pepper**: Additional secret key via `PEPPER` environment variable
  - Stored separately from database
  - Adds extra layer of protection if database is compromised

- **Password Rehashing**: Automatic upgrade when security policy changes
  ```typescript
  needsRehash(): boolean {
      const currentRounds = bcrypt.getRounds(this.password);
      return currentRounds !== getBcryptCost();
  }
  ```

### 1.3 Password Policy

**Pattern**: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`

Requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (@$!%*?&)

---

## 2. Input Whitelisting and Validation

### 2.1 Frontend Validation (React/Yup)

**Implementation Location**: `src/utils/validation.ts`

All user inputs are validated using RegEx patterns that whitelist only allowed characters:

#### Username Pattern
```regex
^[a-zA-Z0-9_.-]+$
```
- Allows: alphanumeric, underscore, dot, hyphen
- Length: 3-30 characters

#### Full Name Pattern
```regex
^[A-Za-z\s-]{2,50}$
```
- Allows: letters, spaces, hyphens only
- Prevents: numbers, special characters, HTML/script injection

#### ID Number Pattern
```regex
^\d{13}$
```
- Exactly 13 digits (South African ID format)
- No letters or special characters allowed

#### Account Number Pattern
```regex
^[A-Za-z0-9]{6,20}$
```
- Alphanumeric only
- Length: 6-20 characters

#### SWIFT Code Pattern
```regex
^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$
```
- Follows international SWIFT standard (ISO 9362)
- 8 or 11 characters
- Uppercase letters and numbers only

#### Amount Pattern
```regex
^\d+(\.\d{1,2})?$
```
- Positive numbers only
- Maximum 2 decimal places
- Prevents negative values or injection attempts

### 2.2 Backend Validation (Express Validator)

**Implementation Location**: `app_backend/src/middleware/validation.ts`

Double validation on backend using `express-validator`:

```typescript
export const validatePayment = [
    body('amount')
        .isNumeric()
        .custom(value => value > 0),
    body('currency')
        .isIn(['USD', 'EUR', 'GBP', 'ZAR']),
    body('recipientName')
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 }),
    body('swiftCode')
        .trim()
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/),
    validateResults
];
```

### 2.3 Input Sanitization

All inputs are sanitized using:
- `trim()` - Remove whitespace
- `escape()` - Encode HTML entities
- Custom sanitization to remove `<>` characters

---

## 3. SSL/TLS Implementation

### 3.1 Backend HTTPS Configuration

**Implementation Location**: `app_backend/src/index.ts`

The backend server enforces HTTPS using SSL certificates:

```typescript
const httpsServer = https.createServer({
    key: fs.readFileSync('certificates/localhost-key.pem'),
    cert: fs.readFileSync('certificates/localhost.pem')
}, app);
```

### 3.2 Certificate Generation

**Script**: `scripts/generate-certs.js`

Self-signed certificates for development:
- Uses `mkcert` for local trusted certificates
- Generates `localhost.pem` and `localhost-key.pem`
- Valid for localhost and 127.0.0.1

### 3.3 HSTS (HTTP Strict Transport Security)

```typescript
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 
        'max-age=31536000; includeSubDomains; preload');
    next();
});
```

**Configuration**:
- `max-age=31536000`: Force HTTPS for 1 year
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser preload lists

### 3.4 Frontend HTTPS

**Configuration**: `package.json`
```json
"scripts": {
    "start": "set HTTPS=true && react-scripts start"
}
```

All frontend traffic served over HTTPS on port 3000.

---

## 4. Attack Protection Measures

### 4.1 SQL Injection Protection

**Method**: TypeORM with Parameterized Queries

TypeORM automatically uses parameterized queries, preventing SQL injection:

```typescript
const user = await userRepository.findOne({
    where: { username } // Parameterized - SAFE
});
```

**Additional Protection**:
- No raw SQL queries used
- All database operations through ORM
- Input validation before database queries

### 4.2 Cross-Site Scripting (XSS) Protection

**Layers of Defense**:

1. **Input Sanitization** - Remove HTML/script tags
   ```typescript
   .replace(/[<>]/g, '')
   .replace(/&/g, '&amp;')
   ```

2. **Output Encoding** - React automatically escapes output
   ```tsx
   <Typography>{user.fullName}</Typography> // Auto-escaped
   ```

3. **Content Security Policy** - Via Helmet middleware
   ```typescript
   app.use(helmet());
   ```

4. **Express Validator Escape** - Server-side sanitization
   ```typescript
   body('fullName').trim().escape()
   ```

### 4.3 Cross-Site Request Forgery (CSRF) Protection

**Method**: SameSite Cookies + JWT Tokens

```typescript
app.use(cors({
    origin: corsOrigins,
    credentials: true // Required for cookies
}));
```

- JWT tokens stored in memory (not cookies)
- CORS restricted to whitelist
- No state-changing GET requests

### 4.4 Clickjacking Protection

**Implementation**: Helmet X-Frame-Options

```typescript
app.use(helmet()); // Sets X-Frame-Options: DENY
```

Prevents the application from being embedded in iframes, protecting against clickjacking attacks.

### 4.5 Session Hijacking Protection

**Multi-Layer Defense**:

1. **HTTPS Only** - Prevents packet sniffing
2. **JWT Expiration** - Tokens expire after 24 hours
   ```typescript
   const token = jwt.sign(
       { userId: user.id, role: user.role },
       jwtSecret,
       { expiresIn: '24h' }
   );
   ```

3. **Audit Logging** - Track all login attempts
   ```typescript
   const log = auditRepo.create({
       actorUserId: user.id,
       action: 'login_success',
       details: { ip: req.ip, timestamp: new Date() }
   });
   ```

### 4.6 Man-in-the-Middle (MITM) Attack Protection

**Protection Measures**:
- **TLS 1.2+**: Modern encryption standards
- **HSTS**: Force HTTPS for all connections
- **Certificate Validation**: Proper SSL certificate chain
- **Secure Headers**: Via Helmet middleware

### 4.7 DDoS and Brute Force Protection

**Implementation**: Express Rate Limiting

**Global Rate Limit**:
```typescript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per IP
});
app.use(limiter);
```

**Login-Specific Rate Limit**:
```typescript
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 min
    message: 'Too many login attempts. Please try again later.'
});
app.use('/api/auth/login', loginLimiter);
```

### 4.8 HTTP Parameter Pollution (HPP)

**Implementation**: HPP Middleware

```typescript
app.use(hpp()); // Prevents parameter pollution
```

Protects against attacks that exploit duplicate parameter names.

### 4.9 Additional Security Headers

**Via Helmet Middleware**:
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Enable XSS filter
- `X-Frame-Options: DENY` - Prevent clickjacking
- `Strict-Transport-Security` - Force HTTPS
- `Content-Security-Policy` - Restrict resource loading

### 4.10 Content-Type Enforcement

```typescript
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const ct = req.headers['content-type'];
        if (!ct.includes('application/json')) {
            return res.status(415).json({ 
                message: 'Content-Type must be application/json' 
            });
        }
    }
    next();
});
```

Prevents content-type confusion attacks.

---

## 5. DevSecOps Pipeline

### 5.1 CircleCI Configuration

**File**: `.circleci/config.yml`

**Pipeline Jobs**:
1. **Build and Test** - Compile TypeScript, run tests
2. **SonarQube Scan** - Code quality and security analysis
3. **Security Scan** - npm audit, dependency checks

### 5.2 GitHub Actions Security CI

**File**: `.github/workflows/security-ci.yml`

**Automated Checks**:
- **CodeQL Analysis** - Static code analysis for vulnerabilities
- **npm audit** - Check for vulnerable dependencies
- **ZAP Baseline Scan** - OWASP ZAP dynamic security testing
- **Build Verification** - Ensure code compiles without errors

### 5.3 SonarQube Integration

**Configuration**: `sonar-project.properties`

**Scans for**:
- Code smells
- Security hotspots
- Vulnerabilities
- Code coverage
- Maintainability issues

---

## 6. Employee Portal Security

### 6.1 No Registration Process

**Requirement**: Employees cannot self-register

**Implementation**:
- Registration route only creates customer accounts
- Employee accounts pre-created via database seeding
- Role enforcement via middleware

### 6.2 Pre-Created Employee Accounts

**Seeding Script**: `app_backend/scripts/seed-employees.js`

Default employee credentials:
- Username: `ops_agent_1`
- Password: `Employee!234`
- Role: `employee`

### 6.3 Role-Based Access Control (RBAC)

**Implementation**: `src/components/RoleRoute.tsx`

```typescript
const RoleRoute = ({ required, children }) => {
    const user = getCurrentUser();
    if (user.role !== required) {
        return <Navigate to="/unauthorized" />;
    }
    return children;
};
```

**Routes**:
- Customer Routes: `/payment`, `/transactions`, `/methods`
- Employee Routes: `/pending` (verify and approve payments)

---

## 7. Data Encryption at Rest

### 7.1 Field-Level Encryption

**Implementation**: `app_backend/src/utils/crypto.ts`

Sensitive fields encrypted using **AES-256-GCM**:

```typescript
export function encryptField(plainText: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plainText, 'utf8'), 
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}
```

**Encrypted Fields**:
- Account numbers
- ID numbers
- Payment details

**Key Management**:
- Encryption key stored in `FIELD_ENCRYPTION_KEY` environment variable
- Minimum 32 characters required
- Never committed to version control

---

## 8. Security Testing Results

### 8.1 Penetration Testing Performed

✅ **SQL Injection** - All parameterized queries, no vulnerabilities  
✅ **XSS Attacks** - Input sanitization prevents script injection  
✅ **CSRF** - Token-based authentication prevents CSRF  
✅ **Clickjacking** - X-Frame-Options header prevents embedding  
✅ **Brute Force** - Rate limiting stops automated attacks  
✅ **Session Hijacking** - HTTPS + JWT expiration mitigates risk  

### 8.2 Compliance

- **OWASP Top 10 (2021)** - All vulnerabilities addressed
- **PCI DSS Guidelines** - Encryption, access control, logging
- **GDPR Principles** - Data encryption, audit trails

---

## 9. Conclusion

The GloBaPay International Payment Portal implements comprehensive security measures across all layers of the application stack. From password hashing and input validation to SSL/TLS encryption and attack protection, the system follows industry best practices and academic security standards.

All requirements for Tasks 2 and 3 of the APDS7311 assignment have been successfully implemented and documented.

---

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Author**: GloBaPay Development Team

