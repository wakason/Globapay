# GloBaPay International Payment Portal

**Course**: Application Development Security (APDS7311)  
**Institution**: The Independent Institute of Education  
**Assessment**: Portfolio of Evidence (POE)  
**Total Marks**: 100 Marks per Task (Tasks 2 & 3)

---

## 📋 Project Overview

GloBaPay is a secure international payment portal system designed for an international bank's internal operations. The system allows customers to initiate international payments through a customer-facing portal, which are then verified and processed by bank employees through a dedicated employee portal.

## ⚡ Quick Start

**Already set up?** Jump to [Running the Application](#running-the-application) section.

**First time?** Follow the complete [Setup and Installation Guide](#-complete-setup-and-installation-guide) below.

**Quick Commands**:
```powershell
# 1. Start MySQL in XAMPP Control Panel
# 2. Start Backend
cd app_backend
npm run dev

# 3. Start Frontend (new terminal)
cd C:\Users\Administrator\Desktop\GloBaPay
npm start

# Access: https://localhost:3000
# Test Accounts: See [Test Accounts](#-test-accounts) section
```

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
   - Automated security hotspot detection
   - Code smell analysis and maintainability ratings
   - GitHub Actions for automated security scanning
   - npm audit for dependency vulnerabilities
   - Location: `.circleci/config.yml`, `.github/workflows/security-ci.yml`, `sonar-project.properties`
   - Setup Guides: `SONARQUBE_SETUP.md`, `GITHUB_CIRCLECI_SETUP.md`

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
├── sonar-project.properties    # SonarQube/SonarCloud configuration
├── SECURITY_IMPLEMENTATION.md  # Detailed security documentation
├── SETUP.md                    # Setup instructions
├── QUICK_START.md              # Quick start guide
├── SONARQUBE_SETUP.md          # SonarQube setup guide
├── GITHUB_CIRCLECI_SETUP.md    # CircleCI setup guide
├── PROJECT_SUMMARY.md          # Project overview
└── README.md                   # This file
```

---

## 🚀 Complete Setup and Installation Guide

This guide will walk you through setting up and running the GloBaPay application from scratch.

### Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Verify npm: `npm --version`

2. **XAMPP** (for MySQL database)
   - Download from: https://www.apachefriends.org/
   - Install and start MySQL service from XAMPP Control Panel

3. **Git for Windows** (includes OpenSSL for certificate generation)
   - Download from: https://gitforwindows.org/
   - Verify installation: `git --version`

4. **PowerShell** (should be pre-installed on Windows)
   - Required for running setup scripts

### Step-by-Step Installation

#### Step 1: Clone or Extract the Repository

If using Git:
```powershell
git clone <repository-url>
cd GloBaPay
```

Or extract the ZIP file to your desired location (e.g., `C:\Users\Administrator\Desktop\GloBaPay`)

#### Step 2: Database Setup

1. **Start XAMPP and MySQL**:
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL service
   - Wait until MySQL shows as "Running" (green)

2. **Create the Database**:
   
   **Option A: Using phpMyAdmin** (Recommended)
   - Click "Admin" next to MySQL in XAMPP Control Panel
   - This opens phpMyAdmin in your browser
   - Click "New" in the left sidebar
   - Database name: `payment_portal`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

   **Option B: Using MySQL Command Line**:
   ```powershell
   # If MySQL is in your PATH
   mysql -u root -e "CREATE DATABASE payment_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

#### Step 3: Backend Setup

1. **Navigate to Backend Directory**:
   ```powershell
   cd app_backend
   ```

2. **Install Dependencies**:
   ```powershell
   npm install
   ```
   This may take a few minutes. Wait for it to complete.

3. **Set Up Environment Variables**:
   
   The project includes a PowerShell script to generate secure keys automatically:
   ```powershell
   # Run the environment setup script
   .\scripts\setup-env.ps1
   ```
   
   **If you get a PowerShell execution policy error**, run this first:
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   
   This script will:
   - Generate secure JWT secret
   - Generate field encryption key
   - Generate server-side pepper for password hashing
   - Create a `.env` file with all required variables
   - Set system environment variables (requires new terminal after running)
   
   **Important**: After running this script, you must open a **NEW** PowerShell terminal for environment variables to take effect.

4. **Build the Backend**:
   ```powershell
   npm run build
   ```
   This compiles TypeScript to JavaScript.

5. **Run Database Migrations**:
   ```powershell
   npm run migration:run
   ```
   This creates all database tables and structure.

6. **Seed Initial Data**:
   ```powershell
   npm run seed:initial
   ```
   This creates test users (customer and employee accounts).

   **Alternative**: You can also seed employees separately:
   ```powershell
   npm run seed:employees
   ```

#### Step 4: Generate SSL Certificates

SSL certificates are required for HTTPS connections:

1. **Navigate to Scripts Directory**:
   ```powershell
   # From app_backend directory
   cd ..\scripts
   ```

2. **Generate Certificates**:
   ```powershell
   node generate-certs.js
   ```
   
   This will:
   - Create a `certificates` folder in the root directory
   - Generate `localhost.pem` and `localhost-key.pem`
   - Install certificates to your system's trusted certificate store (if mkcert is available)

   **Note**: If you see certificate warnings in the browser, this is normal for self-signed certificates. Click "Advanced" → "Proceed to localhost" to continue.

#### Step 5: Frontend Setup

1. **Navigate to Root Directory**:
   ```powershell
   # From scripts directory
   cd ..
   # Or from anywhere: cd C:\Users\Administrator\Desktop\GloBaPay
   ```

2. **Install Dependencies**:
   ```powershell
   npm install
   ```
   This may take a few minutes.

3. **Create Frontend Environment File**:
   ```powershell
   "HTTPS=true" | Out-File -FilePath .env -Encoding UTF8
   ```
   
   Or manually create a `.env` file in the root directory with:
   ```
   HTTPS=true
   ```

### Running the Application

You need to run both the backend and frontend servers. Open **two separate terminal windows**.

#### Terminal 1: Start Backend Server

```powershell
# Navigate to backend directory
cd app_backend

# Start development server
npm run dev
```

**Expected Output**:
```
✓ HTTPS server running on https://localhost:5000
✓ Database connected
✓ Server started successfully
```

**Backend URL**: `https://localhost:5000`

**Health Check**: Open `https://localhost:5000/api/health` in your browser to verify the backend is running.

#### Terminal 2: Start Frontend Server

```powershell
# Navigate to root directory (if not already there)
cd C:\Users\Administrator\Desktop\GloBaPay

# Start React development server
npm start
```

**Expected Output**:
```
Compiled successfully!
You can now view the app in the browser.
  Local:            https://localhost:3000
```

The browser should automatically open to `https://localhost:3000`. If not, manually navigate to this URL.

**Frontend URL**: `https://localhost:3000`

### Verification Steps

After both servers are running, verify the setup:

1. **Backend Health Check**:
   - Open: `https://localhost:5000/api/health`
   - Should show: `{"status":"ok","message":"Server is running"}`

2. **Frontend Access**:
   - Open: `https://localhost:3000`
   - Should see the GloBaPay login page

3. **Database Connection**:
   - Check backend terminal for "Database connected" message
   - No connection errors should appear

### Quick Setup Alternative (If Scripts Are Available)

If the setup scripts are properly configured, you can use these shortcuts:

```powershell
# Complete database setup (migrations + seeding)
cd app_backend
.\scripts\setup-database.ps1

# Or use npm scripts
npm run db:setup  # Runs migrations and seeds data
```

### Resetting the Database (If Needed)

If you need to start fresh:

```powershell
cd app_backend

# Complete reset (drops all tables and recreates)
npm run db:reset

# Or step by step
npm run migration:revert  # Revert last migration
npm run migration:run     # Run migrations again
npm run seed:initial      # Reseed data
```

---

## 👥 Test Accounts

After running the seed scripts, the following test accounts are available:

### Customer Account
- **Username**: `customer1`
- **Password**: `Customer!234`
- **Role**: `customer`
- **Access**: 
  - User registration and login
  - Payment initiation
  - Transaction history viewing
  - Payment method management

### Employee Account
- **Username**: `ops_agent_1`
- **Password**: `Employee!234`
- **Role**: `employee`
- **Access**: 
  - Employee login (no registration)
  - Pending transaction verification
  - SWIFT code validation
  - Payment approval and submission
  - Audit trail access

**Note**: Employee accounts are pre-created in the database and cannot register through the portal. Only customers can register.

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

The project includes a comprehensive CI/CD pipeline for automated security scanning, code quality analysis, and vulnerability detection.

### CircleCI Pipeline

The CircleCI pipeline runs automatically on every push to the repository and includes:

**Jobs**:
1. **build-and-test**: 
   - Installs dependencies (frontend & backend)
   - Builds both frontend and backend projects
   - Runs tests with coverage generation
   - Performs npm audit for dependency vulnerabilities

2. **sonarqube-scan**: 
   - **Security Hotspots**: Identifies potential security vulnerabilities requiring manual review
   - **Code Smells**: Detects maintainability issues and code quality problems
   - **Bugs**: Finds reliability issues and potential runtime errors
   - **Code Coverage**: Reports test coverage metrics
   - **Maintainability Ratings**: Assesses technical debt and code quality

3. **security-scan**: 
   - OWASP dependency vulnerability checks
   - Frontend and backend security audits

**Configuration**: `.circleci/config.yml`

**Setup Guide**: See `GITHUB_CIRCLECI_SETUP.md` for detailed setup instructions.

### GitHub Actions

**Workflows**:
1. **Build and Test**: Both frontend and backend compilation and testing
2. **CodeQL Analysis**: Static code security scanning
3. **OWASP ZAP**: Dynamic application security testing
4. **npm Audit**: Vulnerability scanning

**Configuration**: `.github/workflows/security-ci.yml`

### SonarQube Integration

SonarQube (via SonarCloud) provides automated code quality and security analysis:

**What Gets Scanned**:
- ✅ **Security Hotspots**: SQL injection risks, XSS vulnerabilities, authentication issues, encryption problems, and other security-sensitive code patterns
- ✅ **Code Smells**: Code duplication, complexity issues, maintainability problems, and best practice violations
- ✅ **Bugs**: Reliability issues that could cause runtime errors
- ✅ **Code Coverage**: Test coverage metrics for both frontend and backend
- ✅ **Technical Debt**: Quantified maintenance burden
- ✅ **Maintainability Ratings**: Overall code quality assessment

**Configuration**: `sonar-project.properties`

**Setup Guide**: See `SONARQUBE_SETUP.md` for detailed SonarCloud setup and configuration.

### Quick Setup

1. **Connect to CircleCI**: Follow `GITHUB_CIRCLECI_SETUP.md`
2. **Configure SonarCloud**: Follow `SONARQUBE_SETUP.md`
3. **Add Environment Variables**: 
   - Set `SONAR_TOKEN` in CircleCI context named `sonarcloud`
   - Update `sonar-project.properties` with your project keys
4. **Push to GitHub**: Pipeline runs automatically on push

### Viewing Results

- **CircleCI Dashboard**: Check pipeline status and build logs
- **SonarCloud Dashboard**: View detailed analysis including:
  - Security hotspots requiring review
  - Code smells categorized by severity
  - Coverage reports
  - Quality gate status

---

## 📚 Documentation

- **SECURITY_IMPLEMENTATION.md**: Detailed security measures documentation
- **SETUP.md**: Complete setup instructions for Windows
- **QUICK_START.md**: Quick start guide for local development
- **SONARQUBE_SETUP.md**: Step-by-step guide for setting up SonarQube/SonarCloud integration
- **GITHUB_CIRCLECI_SETUP.md**: Guide for connecting GitHub repository to CircleCI
- **PROJECT_SUMMARY.md**: Comprehensive project overview and architecture
- **app_backend/docs/MIGRATIONS.md**: Database migration guide (if exists)
- **app_backend/docs/PRODUCTION-DEPLOYMENT.md**: Production deployment guide (if exists)

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

### Common Issues and Solutions

#### 1. Database Connection Issues

**Problem**: "Cannot connect to database" or "ECONNREFUSED"

**Solutions**:
```powershell
# Verify MySQL is running in XAMPP Control Panel
# MySQL should show as "Running" (green)

# Check if database exists
# Open phpMyAdmin and verify "payment_portal" database exists
# If not, create it: CREATE DATABASE payment_portal;

# Test database connection
cd app_backend
npm run migration:show

# Check database credentials in .env file
# Verify: DB_HOST=localhost, DB_PORT=3306, DB_USER=root, DB_NAME=payment_portal
```

#### 2. Certificate Errors

**Problem**: Browser shows "Not Secure" or certificate warnings

**Solutions**:
```powershell
# Regenerate certificates
cd scripts
node generate-certs.js

# Verify certificates exist
cd ..
dir certificates

# Should see: localhost.pem and localhost-key.pem

# For self-signed certificates, you may need to:
# - Click "Advanced" in browser
# - Click "Proceed to localhost (unsafe)" or "Accept the risk"
```

#### 3. Port Already in Use

**Problem**: "Port 5000 already in use" or "Port 3000 already in use"

**Solutions**:
```powershell
# Find process using port 5000 (backend)
netstat -ano | findstr :5000
# Note the PID number

# Find process using port 3000 (frontend)
netstat -ano | findstr :3000
# Note the PID number

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F

# Or change the port in .env file:
# PORT=5001  (for backend)
# And update CORS_ORIGINS in backend .env
```

#### 4. PowerShell Script Execution Error

**Problem**: "Cannot load file ... execution of scripts is disabled"

**Solution**:
```powershell
# Allow script execution for current user
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify the change
Get-ExecutionPolicy -Scope CurrentUser
# Should return: RemoteSigned
```

#### 5. Environment Variables Not Loading

**Problem**: "JWT_SECRET is not defined" or similar errors

**Solutions**:
```powershell
# After running setup-env.ps1, you MUST open a NEW terminal
# Environment variables are set for new processes only

# Or create/update .env file manually in app_backend directory:
# JWT_SECRET=your-secret-here
# FIELD_ENCRYPTION_KEY=your-key-here
# etc.

# Verify .env file exists
cd app_backend
dir .env

# Check contents
type .env
```

#### 6. Migration Errors

**Problem**: "Migration failed" or "Table already exists"

**Solutions**:
```powershell
# Check migration status
cd app_backend
npm run migration:show

# If tables exist but migration fails, you can:
# Option 1: Reset database (WARNING: Deletes all data)
npm run db:reset

# Option 2: Drop and recreate database manually
# In phpMyAdmin: Drop database payment_portal
# Then: CREATE DATABASE payment_portal;
# Then: npm run migration:run
```

#### 7. Module Not Found Errors

**Problem**: "Cannot find module" or "Module not found"

**Solutions**:
```powershell
# Reinstall dependencies
cd app_backend
rm -r node_modules
rm package-lock.json
npm install

# Do the same for frontend
cd ..
rm -r node_modules
rm package-lock.json
npm install
```

#### 8. TypeScript Build Errors

**Problem**: "Type errors" or "Build failed"

**Solutions**:
```powershell
# Clean build
cd app_backend
rm -r dist
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### 9. Rate Limiting (Too Many Login Attempts)

**Problem**: "Too many login attempts. Please try again later."

**Solution**:
```powershell
# Wait 15 minutes for rate limit to reset
# Or restart the backend server to clear rate limit counters
# In backend terminal: Ctrl+C to stop, then npm run dev to restart
```

#### 10. CORS Errors

**Problem**: "CORS policy" errors in browser console

**Solutions**:
```powershell
# Check backend .env file
# CORS_ORIGINS should include: https://localhost:3000

# Verify frontend is running on correct port
# Default: https://localhost:3000

# Restart backend after changing CORS settings
```

### Getting Help

If you encounter other issues:

1. **Check the logs**:
   - Backend terminal for server errors
   - Browser console (F12) for frontend errors
   - Database connection messages

2. **Verify prerequisites**:
   - Node.js version: `node --version` (should be v16+)
   - MySQL is running in XAMPP
   - All dependencies installed

3. **Review documentation**:
   - `SETUP.md` for detailed setup instructions
   - `QUICK_START.md` for quick reference
   - `SECURITY_IMPLEMENTATION.md` for security details

4. **Reset and start fresh**:
   ```powershell
   # Complete reset (use with caution)
   cd app_backend
   npm run db:reset
   npm run seed:initial
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
