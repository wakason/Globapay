Param(
	[string]$DbName = "payment_portal",
	[string]$DbHost = $env:DB_HOST,
	[string]$DbPort = $env:DB_PORT,
	[string]$DbUser = $env:DB_USER,
	[string]$DbPassword = $env:DB_PASSWORD
)

if (-not $DbHost -or $DbHost -eq '') { $DbHost = 'localhost' }
if (-not $DbPort -or $DbPort -eq '') { $DbPort = '3306' }
if (-not $DbUser -or $DbUser -eq '') { $DbUser = 'root' }

$mysql = 'mysql'
$args = @('-h', $DbHost, '-P', $DbPort, '-u', $DbUser)
if ($DbPassword -and $DbPassword -ne '') { $args += "-p$DbPassword" }

$sql = "DROP DATABASE IF EXISTS $DbName; CREATE DATABASE $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

Write-Host "Dropping and creating database '$DbName'..." -ForegroundColor Yellow
& $mysql @args -e $sql
if ($LASTEXITCODE -ne 0) { throw "Failed to drop/create database $DbName" }

Write-Host "Done." -ForegroundColor Green


