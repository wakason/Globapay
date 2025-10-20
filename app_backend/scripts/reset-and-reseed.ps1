Param(
	[string]$DbHost = $env:DB_HOST,
	[string]$DbPort = $env:DB_PORT,
	[string]$DbUser = $env:DB_USER,
	[string]$DbPassword = $env:DB_PASSWORD,
	[string]$DbName = $env:DB_NAME
)

Write-Host "Resetting '$DbName' users table and reseeding employees..." -ForegroundColor Cyan

if (-not $DbHost) { $DbHost = 'localhost' }
if (-not $DbPort) { $DbPort = '3306' }
if (-not $DbUser) { $DbUser = 'root' }
if (-not $DbName) { $DbName = 'payment_portal' }

$mysql = 'mysql'
$args = @('-h', $DbHost, '-P', $DbPort, '-u', $DbUser)
if ($DbPassword -and $DbPassword -ne '') { $args += "-p$DbPassword" }
$sql = @"
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE $DbName.users;
TRUNCATE TABLE $DbName.payment_methods;
TRUNCATE TABLE $DbName.transactions;
TRUNCATE TABLE $DbName.audit_logs;
SET FOREIGN_KEY_CHECKS=1;
"@

try {
	& $mysql @args -e $sql | Out-Null
	Write-Host "Tables truncated." -ForegroundColor Green
} catch {
	Write-Error "Failed to truncate tables. Ensure MySQL client is installed and in PATH. $_"
	exit 1
}

Write-Host "Seeding employees using scripts/seed-employees.js ..." -ForegroundColor Yellow
try {
	node "$PSScriptRoot/seed-employees.js"
	Write-Host "Employees seeded." -ForegroundColor Green
} catch {
	Write-Error "Failed to seed employees. $_"
	exit 1
}

Write-Host "Done." -ForegroundColor Cyan


