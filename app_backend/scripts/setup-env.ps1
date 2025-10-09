Param(
    [string]$Port = "5000",
    [string]$JwtSecret = "",
    [string]$FieldEncryptionKey = "",
    [string]$DbHost = "localhost",
    [string]$DbPort = "3306",
    [string]$DbUser = "root",
    [string]$DbPassword = "",
    [string]$DbName = "payment_portal",
    [string]$SwiftApiUrl = "https://sandbox.swift.example",
    [string]$SwiftApiKey = "dummy",
    [string]$SeedEmployees = "emp1:Employee One:555555555555:8001015009087:P@ssw0rd!",
    [switch]$CreateDb,
    [switch]$WriteDotEnv,
    [switch]$LoadCurrent
)

function New-RandomHexString {
    Param([int]$numBytes = 32)
    $bytes = New-Object 'System.Byte[]' ($numBytes)
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    -join ($bytes | ForEach-Object { $_.ToString('x2') })
}

if (-not $JwtSecret -or $JwtSecret.Length -lt 32) {
    Write-Host "Generating random JWT_SECRET..."
    $JwtSecret = New-RandomHexString 48
}

if (-not $FieldEncryptionKey -or $FieldEncryptionKey.Length -lt 32) {
    Write-Host "Generating FIELD_ENCRYPTION_KEY (>=32 chars)..."
    # 32 bytes => 64 hex chars
    $FieldEncryptionKey = New-RandomHexString 32
}

Write-Host "Setting environment variables (permanent for current user)" -ForegroundColor Cyan

setx NODE_ENV "development" | Out-Null
setx PORT $Port | Out-Null
setx JWT_SECRET $JwtSecret | Out-Null
setx JWT_EXPIRATION "24h" | Out-Null
setx FIELD_ENCRYPTION_KEY $FieldEncryptionKey | Out-Null

setx DB_HOST $DbHost | Out-Null
setx DB_PORT $DbPort | Out-Null
setx DB_USER $DbUser | Out-Null
if ($DbPassword -ne '') {
    setx DB_PASSWORD $DbPassword | Out-Null
} else {
    Write-Host "Skipping DB_PASSWORD since empty; backend defaults to no password." -ForegroundColor Yellow
}
setx DB_NAME $DbName | Out-Null

setx SWIFT_API_URL $SwiftApiUrl | Out-Null
setx SWIFT_API_KEY $SwiftApiKey | Out-Null

setx SEED_EMPLOYEES $SeedEmployees | Out-Null

Write-Host "Environment variables saved. You must open a NEW terminal for them to take effect." -ForegroundColor Green

if ($LoadCurrent) {
    Write-Host "Also loading variables into CURRENT session..." -ForegroundColor Yellow
    $env:NODE_ENV = "development"
    $env:PORT = $Port
    $env:JWT_SECRET = $JwtSecret
    $env:JWT_EXPIRATION = "24h"
    $env:FIELD_ENCRYPTION_KEY = $FieldEncryptionKey
    $env:DB_HOST = $DbHost
    $env:DB_PORT = $DbPort
    $env:DB_USER = $DbUser
    if ($DbPassword -ne '') { $env:DB_PASSWORD = $DbPassword } else { Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue }
    $env:DB_NAME = $DbName
    $env:SWIFT_API_URL = $SwiftApiUrl
    $env:SWIFT_API_KEY = $SwiftApiKey
    $env:SEED_EMPLOYEES = $SeedEmployees
}

if ($WriteDotEnv) {
    $dotenvPath = Join-Path (Split-Path -Parent $PSScriptRoot) ".env"
    Write-Host "Writing $dotenvPath ..." -ForegroundColor Yellow
    $lines = @(
        "NODE_ENV=development",
        "PORT=$Port",
        "JWT_SECRET=$JwtSecret",
        "JWT_EXPIRATION=24h",
        "FIELD_ENCRYPTION_KEY=$FieldEncryptionKey",
        "DB_HOST=$DbHost",
        "DB_PORT=$DbPort",
        "DB_USER=$DbUser",
        "DB_PASSWORD=$DbPassword",
        "DB_NAME=$DbName",
        "SWIFT_API_URL=$SwiftApiUrl",
        "SWIFT_API_KEY=$SwiftApiKey",
        "SEED_EMPLOYEES=$SeedEmployees"
    )
    Set-Content -Path $dotenvPath -Value ($lines -join "`r`n") -Encoding ASCII
    Write-Host ".env written." -ForegroundColor Green
}

if ($CreateDb) {
    Write-Host "Attempting to create MySQL database '$DbName' (requires 'mysql' client in PATH)..." -ForegroundColor Yellow
    try {
        $args = @('-h', $DbHost, '-P', $DbPort, '-u', $DbUser)
        if ($DbPassword -ne '') { $args += "-p$DbPassword" }
        $sql = "CREATE DATABASE IF NOT EXISTS $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        $args += @('-e', $sql)
        & mysql @args | Out-Null
        Write-Host "Database ensured." -ForegroundColor Green
    } catch {
        Write-Warning "Could not create database automatically. Please ensure MySQL is running and create the DB manually: CREATE DATABASE IF NOT EXISTS $DbName;"
    }
}

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host (" PORT={0}`n JWT_SECRET={1}`n FIELD_ENCRYPTION_KEY={2}`n DB_HOST={3}`n DB_PORT={4}`n DB_USER={5}`n DB_NAME={6}`n SWIFT_API_URL={7}`n SWIFT_API_KEY={8}`n SEED_EMPLOYEES={9}" -f $Port, $JwtSecret, $FieldEncryptionKey, $DbHost, $DbPort, $DbUser, $DbName, $SwiftApiUrl, $SwiftApiKey, $SeedEmployees)
Write-Host "Next: open a NEW terminal, then run: npm run build && npm start" -ForegroundColor Cyan


