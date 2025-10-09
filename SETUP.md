# GloBaPay Setup Guide (Windows)

This guide will help you set up and run the GloBaPay web application on Windows.

## Prerequisites

1. Node.js (v16 or higher) - Download from https://nodejs.org/
2. XAMPP (for MySQL) - Download from https://www.apachefriends.org/
3. Git for Windows (includes OpenSSL) - Download from https://gitforwindows.org/

## Database Setup

1. Install XAMPP if not already installed
2. Start MySQL from XAMPP Control Panel
3. Open MySQL Admin (phpMyAdmin) from XAMPP
4. Create a new database:
```sql
CREATE DATABASE payment_portal;
```

Alternatively, you can use the automated setup script:
```powershell
cd C:\Users\Administrator\Desktop\GloBaPay\app_backend
.\scripts\setup-env.ps1 -CreateDb
```

5. Initialize the database and seed initial data:
```powershell
# Build TypeScript files first
npm run build

# Run database migrations and seed initial employees
npm run migration:run
npm run seed:employees
```

This will:
- Create database tables
- Set up proper indexes and constraints
- Create initial employee accounts

## Backend Setup (app_backend folder)

1. Open Windows PowerShell and install dependencies:
```powershell
cd C:\GloBaPay\app_backend
npm install
```

2. Run the environment setup script:
```powershell
.\scripts\setup-env.ps1
```

This script will:
- Generate secure keys for JWT and field encryption
- Set up all required environment variables
- Create a .env file with the configuration

3. Set up SSL certificates:
```powershell
cd ..\scripts
node generate-certs.js
```

## Frontend Setup (root folder)

1. Install dependencies:
```powershell
cd C:\GloBaPay
npm install
```

2. Create frontend environment file:
```powershell
"HTTPS=true" | Out-File -FilePath .env -Encoding UTF8
```

## Running the Application

### 1. Start the Backend

```powershell
cd C:\Users\Administrator\Desktop\GloBaPay\app_backend
npm run dev

```

The backend will be available at `https://localhost:5000`

### 2. Start the Frontend

Open a new PowerShell window:
```powershell
cd C:\GloBaPay
npm start
```

The application will be available at `https://localhost:3000`

## Test Accounts

### Customer Account
- Username: customer1
- Password: Customer!234

### Employee Account
- Username: ops_agent_1
- Password: Employee!234

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=<generated-by-setup-script>
JWT_EXPIRATION=24h
FIELD_ENCRYPTION_KEY=<generated-by-setup-script>
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=payment_portal
SWIFT_API_URL=https://sandbox.swift.example
SWIFT_API_KEY=dummy
```

### Frontend (.env)
```
HTTPS=true
```

## Troubleshooting

1. If you see certificate errors:
   - Make sure you've run the `generate-certs.js` script
   - Check that the certificates are in the correct location
   - Try running PowerShell as Administrator

2. If the backend fails to start:
   - Verify XAMPP MySQL service is running
   - Check MySQL credentials in XAMPP (default: root with no password)
   - Try running `services.msc` and restart MySQL service

3. For database connection issues:
   - Verify DB_* environment variables in .env file
   - Check MySQL port in XAMPP (default: 3306)
   - Make sure no other MySQL instance is running

4. For auth issues:
   - Run setup-env.ps1 script again to regenerate JWT_SECRET
   - Clear browser cache and cookies
   - Check Windows Environment Variables are set correctly

5. If PowerShell scripts fail:
   - Run this command as Administrator to allow script execution:
     ```powershell
     Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

## Security Notes

- All traffic is served over HTTPS
- Passwords are hashed and salted
- Sensitive fields are encrypted at rest
- Input validation is enforced
- Security headers are enabled
