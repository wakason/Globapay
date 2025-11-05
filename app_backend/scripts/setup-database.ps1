# Database Setup Script for Windows
# This script sets up the database with migrations and seed data

param(
    [switch]$Reset,
    [switch]$MigrationsOnly,
    [switch]$SeedOnly
)

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  GloBaPay Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the app_backend directory" -ForegroundColor Red
    exit 1
}

# Load environment variables
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✓ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "⚠ Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "  Run .\scripts\setup-env.ps1 first" -ForegroundColor Yellow
}

# Get database settings
$dbName = $env:DB_NAME
if (-not $dbName) {
    $dbName = "payment_portal"
}

Write-Host ""
Write-Host "Database: $dbName" -ForegroundColor Cyan
Write-Host "Host: $($env:DB_HOST)" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
try {
    $mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue
    if (-not $mysqlProcess) {
        Write-Host "⚠ Warning: MySQL doesn't appear to be running" -ForegroundColor Yellow
        Write-Host "  Please start MySQL from XAMPP Control Panel" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✓ MySQL is running" -ForegroundColor Green
} catch {
    Write-Host "⚠ Warning: Could not verify MySQL status" -ForegroundColor Yellow
}

Write-Host ""

# Handle reset
if ($Reset) {
    Write-Host "⚠ WARNING: Database reset will DELETE ALL DATA!" -ForegroundColor Red
    Write-Host "  Press Ctrl+C to cancel or any other key to continue..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
    
    Write-Host "Resetting database..." -ForegroundColor Yellow
    npm run db:reset
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Database reset complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Test accounts created:" -ForegroundColor Cyan
        Write-Host "  Customer: customer1 / Customer!234" -ForegroundColor White
        Write-Host "  Employee: ops_agent_1 / Employee!234" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✗ Database reset failed" -ForegroundColor Red
        exit 1
    }
    exit 0
}

# Run migrations
if (-not $SeedOnly) {
    Write-Host "Step 1/2: Running migrations..." -ForegroundColor Cyan
    npm run migration:run
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Migration failed" -ForegroundColor Red
        Write-Host "  See error above for details" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✓ Migrations completed successfully" -ForegroundColor Green
    Write-Host ""
}

# Run seed data
if (-not $MigrationsOnly) {
    Write-Host "Step 2/2: Seeding initial data..." -ForegroundColor Cyan
    npm run seed:initial
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Seeding failed" -ForegroundColor Red
        Write-Host "  See error above for details" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✓ Seeding completed successfully" -ForegroundColor Green
}

# Success message
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Test accounts:" -ForegroundColor Cyan
Write-Host "  Customer: customer1 / Customer!234" -ForegroundColor White
Write-Host "  Employee: ops_agent_1 / Employee!234" -ForegroundColor White
Write-Host ""
Write-Host "You can now start the backend server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

