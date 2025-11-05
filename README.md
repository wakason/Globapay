# GloBaPay International Payment Portal

**Course**: Application Development Security (APDS7311)  
**Institution**: The Independent Institute of Education  
**Assessment**: Portfolio of Evidence (POE)  
**Total Marks**: 100 Marks per Task (Tasks 2 & 3)

---

## 📋 Project Overview

GloBaPay is a secure international payment portal system designed for an international bank's internal operations. The system allows customers to initiate international payments through a customer-facing portal, which are then verified and processed by bank employees through a dedicated employee portal.

### Key Features

✅ **Customer Portal**
- Secure user registration and authentication
- International payment initiation (SWIFT)
- Transaction history viewing
- Payment method management
- Real-time payment tracking

✅ **Employee Portal**
- Pre-authenticated employee access (no registration)
- Pending transaction verification
- SWIFT code validation
- Payment approval and submission
- Audit trail logging

✅ **Security Features**
- Password hashing with bcrypt (salt + pepper)
- Input whitelisting using RegEx patterns
- SSL/TLS encryption for all traffic
- Protection against OWASP Top 10 vulnerabilities
- Rate limiting and brute-force protection
- Field-level encryption for sensitive data

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18.2 with TypeScript
- Material-UI (MUI) v5 for modern UI components
- Formik + Yup for form validation
- Axios for API communication
- React Router for navigation

**Backend**
- Node.js with Express.js
- TypeScript for type safety
- TypeORM for database management
- MySQL database (via XAMPP)
- JWT for authentication
- Bcrypt for password hashing

**Security Tools**
- Helmet.js - Security headers
- Express Rate Limit - DDoS protection
- Express Validator - Input validation
- HPP - HTTP Parameter Pollution prevention
- CORS - Cross-Origin Resource Sharing control

**DevSecOps**
- CircleCI for CI/CD pipeline
- SonarQube for code quality analysis
- GitHub Actions for security scanning
- OWASP ZAP for vulnerability scanning
- CodeQL for static analysis

---

## 🔐 Security Implementation

This project implements comprehensive security measures as required by the APDS7311 assignment:

### Task 2: Customer Portal Security ✅

1. ✅ **Password Hashing and Salting**
   - Bcrypt with configurable cost factor (default: 12)
   - Server-side pepper for additional security
   - Automatic password rehashing when policy changes
   - Location: `app_backend/src/models/User.ts`

2. ✅ **Input Whitelisting with RegEx**
   - All inputs validated against strict RegEx patterns
   - Frontend validation with Yup schemas
   - Backend validation with express-validator
   - Location: `src/utils/validation.ts`, `app_backend/src/middleware/validation.ts`

3. ✅ **SSL/TLS for All Traffic**
   - HTTPS enforced on both frontend and backend
   - HSTS headers for browser enforcement
   - Self-signed certificates for development
   - Location: `app_backend/src/index.ts`, `scripts/generate-certs.js`

4. ✅ **Attack Protection**
   - **SQL Injection**: TypeORM parameterized queries
   - **XSS**: Input sanitization + React auto-escaping
   - **CSRF**: JWT tokens + CORS whitelist
   - **Clickjacking**: X-Frame-Options header
   - **Session Hijacking**: HTTPS + JWT expiration + audit logging
   - **MITM**: TLS encryption + HSTS
   - **DDoS**: Rate limiting (global + login-specific)
   
   Location: `app_backend/src/index.ts`, `app_backend/src/middleware/`

### Task 3: Employee Portal Security ✅

1. ✅ **Pre-Created Users (No Registration)**
   - Employee accounts created via database seeding
   - No registration endpoint for employees
   - Role-based access control enforced
   - Location: `app_backend/scripts/seed-employees.js`

2. ✅ **Password Security**
   - Same bcrypt hashing with salt + pepper
   - Password complexity requirements enforced
   - Location: `app_backend/src/models/User.ts`

3. ✅ **Input Whitelisting**
   - All employee inputs validated with RegEx
   - Double validation (frontend + backend)
   - Location: `src/utils/validation.ts`

4. ✅ **SSL/TLS Traffic**
   - All employee portal traffic over HTTPS
   - Same security headers as customer portal
   - Location: `app_backend/src/index.ts`

5. ✅ **Attack Protection**
   - All attack vectors covered (as listed in Task 2)
   - Additional RBAC for employee-only routes
   - Location: `src/components/RoleRoute.tsx`

6. ✅ **DevSecOps Pipeline**
   - CircleCI configuration with SonarQube integration
   - GitHub Actions for automated security scanning
   - npm audit for dependency vulnerabilities
   - Location: `.circleci/config.yml`, `.github/workflows/security-ci.yml`

---

## 📁 Project Structure

```
GloBaPay/
├── app_backend/                 # Backend API
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── models/             # TypeORM entities
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Crypto, helpers
│   │   └── index.ts            # Express server setup
│   ├── scripts/                # Database seeding, migrations
│   └── package.json
├── src/                        # Frontend React app
│   ├── components/             # React components
│   │   ├── CustomerPortal.tsx  # Customer dashboard
│   │   ├── PendingTransactions.tsx  # Employee dashboard
│   │   ├── PaymentForm.tsx     # Payment initiation
│   │   ├── LoginForm.tsx       # Authentication
│   │   └── ...
│   ├── services/               # API clients
│   ├── utils/                  # Validation, formatting
│   └── App.tsx                 # Main app component
├── scripts/                    # Setup scripts
│   └── generate-certs.js       # SSL certificate generation
├── .circleci/                  # CircleCI configuration
│   └── config.yml
├── .github/workflows/          # GitHub Actions
│   └── security-ci.yml
├── SECURITY_IMPLEMENTATION.md  # Detailed security documentation
├── SETUP.md                    # Setup instructions
└── README.md                   # This file
```

---

## 🚀 Setup and Installation

### Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **XAMPP** (for MySQL) - [Download](https://www.apachefriends.org/)
3. **Git for Windows** - [Download](https://gitforwindows.org/)

### Installation Steps

#### 1. Database Setup

Start XAMPP and create the database:

```powershell
# Start MySQL from XAMPP Control Panel
# Then create database in phpMyAdmin or via command:
CREATE DATABASE payment_portal;
```

#### 2. Backend Setup

```powershell
# Navigate to backend directory
cd app_backend

# Install dependencies
npm install

# Set up environment variables (generates JWT_SECRET, encryption keys)
.\scripts\setup-env.ps1

# Run database migrations
npm run migration:run

# Seed initial data (creates test users)
npm run seed:initial
```

#### 3. Generate SSL Certificates

```powershell
# Return to root directory
cd ..

# Generate self-signed certificates
cd scripts
node generate-certs.js
```

#### 4. Frontend Setup

```powershell
# From root directory
cd C:\Users\Administrator\Desktop\GloBaPay

# Install dependencies
npm install

# Create frontend environment file
"HTTPS=true" | Out-File -FilePath .env -Encoding UTF8
```

### Running the Application

#### Start Backend (Terminal 1)

```powershell
cd app_backend
npm run dev
```

Backend runs on: `https://localhost:5000`

#### Start Frontend (Terminal 2)

```powershell
# From root directory
npm start
```

Frontend runs on: `https://localhost:3000`

---

## 👥 Test Accounts

### Customer Account
- **Username**: `customer1`
- **Password**: `Customer!234`
- **Access**: Payment initiation, transaction history

### Employee Account
- **Username**: `ops_agent_1`
- **Password**: `Employee!234`
- **Access**: Pending transaction verification, SWIFT submission

---

## 🔒 Security Features Detail

### 1. Password Security

**Implementation**:
- Bcrypt with cost factor 12 (configurable)
- Unique salt per password
- Server-side pepper (environment variable)
- Automatic rehashing on policy change

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (@$!%*?&)

### 2. Input Validation

All inputs validated using **whitelist** approach with RegEx:

| Field | Pattern | Description |
|-------|---------|-------------|
| Username | `^[a-zA-Z0-9_.-]+$` | Alphanumeric + _ . - only |
| Full Name | `^[A-Za-z\s-]{2,50}$` | Letters, spaces, hyphens |
| ID Number | `^\d{13}$` | Exactly 13 digits |
| Account Number | `^[A-Za-z0-9]{6,20}$` | 6-20 alphanumeric |
| SWIFT Code | `^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$` | ISO 9362 standard |
| Amount | `^\d+(\.\d{1,2})?$` | Positive number, 2 decimals |

### 3. SSL/TLS Configuration

- **Protocol**: TLS 1.2+
- **Certificates**: Self-signed for development (mkcert)
- **HSTS**: Enabled with 1-year max-age
- **Frontend**: HTTPS on port 3000
- **Backend**: HTTPS on port 5000

### 4. Attack Protection

| Attack Vector | Protection Mechanism |
|---------------|---------------------|
| SQL Injection | TypeORM parameterized queries |
| XSS | Input sanitization + React escaping + CSP |
| CSRF | JWT tokens + SameSite + CORS whitelist |
| Clickjacking | X-Frame-Options: DENY |
| Session Hijacking | HTTPS + JWT expiration + audit logs |
| MITM | TLS encryption + HSTS |
| DDoS | Rate limiting (100 req/15min global, 5 req/15min login) |
| HPP | HPP middleware |

### 5. Data Encryption

**At Rest**:
- AES-256-GCM encryption for sensitive fields
- Encrypted fields: account numbers, ID numbers
- Unique IV per encryption operation

**In Transit**:
- TLS 1.2+ for all communications
- HTTPS enforced via HSTS headers

---

## 🧪 Testing

### Security Testing

```powershell
# Run npm security audit
cd app_backend
npm audit

# Run tests (if configured)
npm test
```

### Manual Testing Checklist

- [ ] Customer can register and login
- [ ] Employee can login (not register)
- [ ] Customer can initiate payment
- [ ] Employee can verify and approve payment
- [ ] SWIFT code validation works
- [ ] Rate limiting prevents brute force
- [ ] HTTPS enforced on all pages
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Unauthorized role access denied

---

## 📊 DevSecOps Pipeline

### CircleCI Pipeline

**Jobs**:
1. **build-and-test**: Compile TypeScript, run tests, npm audit
2. **sonarqube-scan**: Code quality and security analysis
3. **security-scan**: Dependency vulnerability check

**Configuration**: `.circleci/config.yml`

### GitHub Actions

**Workflows**:
1. **Build and Test**: Both frontend and backend
2. **CodeQL Analysis**: Static code security scanning
3. **OWASP ZAP**: Dynamic application security testing
4. **npm Audit**: Vulnerability scanning

**Configuration**: `.github/workflows/security-ci.yml`

### SonarQube Integration

**Scans**:
- Security hotspots
- Code smells
- Vulnerabilities
- Code coverage
- Maintainability ratings

**Configuration**: `sonar-project.properties`

---

## 📚 Documentation

- **SECURITY_IMPLEMENTATION.md**: Detailed security measures documentation
- **SETUP.md**: Complete setup instructions for Windows
- **app_backend/docs/MIGRATIONS.md**: Database migration guide
- **app_backend/docs/PRODUCTION-DEPLOYMENT.md**: Production deployment guide

---

## 🎥 Demonstration Video

A comprehensive demonstration video showing both portals in action is included:
- File: `GlobaPay.mp4`
- Covers: Registration, login, payment flow, employee verification

---

## 🛠️ Environment Variables

### Backend (.env)

```env
# Node Environment
NODE_ENV=development
PORT=5000

# Security Keys (auto-generated by setup-env.ps1)
JWT_SECRET=<generated-secret>
JWT_EXPIRATION=24h
FIELD_ENCRYPTION_KEY=<generated-key>
BCRYPT_COST=12
PEPPER=<generated-pepper>

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=payment_portal

# CORS Configuration
CORS_ORIGINS=https://localhost:3000,https://localhost:5001

# SWIFT API (Mock for development)
SWIFT_API_URL=https://sandbox.swift.example
SWIFT_API_KEY=dummy
```

### Frontend (.env)

```env
HTTPS=true
```

---

## 🔧 Troubleshooting

### Database Connection Issues

```powershell
# Verify MySQL is running
services.msc

# Check database exists
# In phpMyAdmin: CREATE DATABASE payment_portal;

# Test connection
cd app_backend
npm run migration:show
```

### Certificate Errors

```powershell
# Regenerate certificates
cd scripts
node generate-certs.js

# Verify certificate location
dir ..\certificates
```

### Port Already in Use

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### PowerShell Script Execution

```powershell
# Allow script execution
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📖 Academic Context

### Assignment Tasks Completed

#### ✅ Task 2: Customer International Payments Portal (80 Marks)

1. ✅ Password hashing with salt and pepper (bcrypt)
2. ✅ Input whitelisting using RegEx patterns
3. ✅ SSL/TLS for all traffic
4. ✅ Protection against all specified attacks
5. ✅ Demonstration video included

#### ✅ Task 3: Employee International Payments Portal (80 Marks)

1. ✅ Pre-created users (no registration process)
2. ✅ Password security enforcement
3. ✅ Input whitelisting with RegEx
4. ✅ SSL/TLS traffic encryption
5. ✅ Attack protection measures
6. ✅ CircleCI + SonarQube DevSecOps pipeline
7. ✅ Demonstration video included

### Learning Outcomes Achieved

- ✅ Implemented secure authentication and authorization
- ✅ Applied input validation and sanitization techniques
- ✅ Configured SSL/TLS for encrypted communications
- ✅ Protected against OWASP Top 10 vulnerabilities
- ✅ Set up automated security scanning pipeline
- ✅ Implemented role-based access control (RBAC)
- ✅ Applied defense-in-depth security principles

---

## 👨‍💻 Development Team

**Course**: APDS7311 - Application Development Security  
**Institution**: The Independent Institute of Education  
**Academic Year**: 2025

---

## 📝 License

This project is submitted as part of academic coursework for the APDS7311 module at The Independent Institute of Education. All rights reserved.

---

## 🆘 Support

For questions or issues related to this project:

1. Review the `SECURITY_IMPLEMENTATION.md` for security details
2. Check `SETUP.md` for installation help
3. Consult the troubleshooting section above
4. Review the demonstration video for usage examples

---

**Last Updated**: November 5, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
