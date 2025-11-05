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
cd C:\GloBaPay\app_backend
.\scripts\setup-env.ps1 -CreateDb
```

5. Initialize the database using migrations:
```powershell
# Run database migrations and seed initial data
cd app_backend
npm run db:setup
```

This will:
- Create all database tables with proper schema
- Set up indexes and foreign keys for optimal performance
- Seed test customer and employee accounts

**Note**: We use TypeORM migrations for schema management. See `app_backend/docs/MIGRATIONS.md` for details.

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

## Database Migrations

GloBaPay uses TypeORM migrations for database schema management. This provides version control for your database and ensures safe, reproducible deployments.

### Common Migration Commands

```powershell
# View migration status
npm run migration:show

# Run pending migrations
npm run migration:run

# Rollback last migration
npm run migration:revert

# Reset database (development only - DELETES ALL DATA)
npm run db:reset

# Create new migration after model changes
npm run migration:generate -- src/migrations/YourMigrationName
```

### For More Information

- **Quick Reference**: `app_backend/docs/MIGRATION-QUICK-REFERENCE.md`
- **Full Guide**: `app_backend/docs/MIGRATIONS.md`

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
   - Try `npm run migration:show` to test database connection

4. For migration issues:
   - Check database exists: `CREATE DATABASE payment_portal;`
   - Ensure migrations directory exists: `app_backend/src/migrations/`
   - See `app_backend/docs/MIGRATIONS.md` for troubleshooting guide

5. For auth issues:
   - Run setup-env.ps1 script again to regenerate JWT_SECRET
   - Clear browser cache and cookies
   - Check Windows Environment Variables are set correctly

6. If PowerShell scripts fail:
   - Run this command as Administrator to allow script execution:
     ```powershell
     Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

## Security Notes

- All traffic is served over HTTPS (backend attempts HTTPS with `certificates/localhost*.pem`; falls back to HTTP if missing). Use `npm run generate-certs` at repo root to create them.
- Passwords are hashed and salted with bcrypt and a server-side pepper. Cost factor is configurable via `BCRYPT_COST`.
- Sensitive fields are encrypted at rest using AES-256-GCM with `FIELD_ENCRYPTION_KEY`.
- Input validation and sanitization is enforced via `express-validator` with strict regexes and escaping.
- Security headers are enabled (Helmet + HSTS) and HTTP Parameter Pollution is mitigated.
- Global and per-route rate limiting is configured (login brute-force protection).
- CORS origins are allowlisted via `CORS_ORIGINS` (comma-separated).
- CI pipeline runs lint/build/tests, npm audit, CodeQL, and ZAP baseline on push/PR.
