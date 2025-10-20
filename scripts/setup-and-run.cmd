@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Simple one-click setup for Windows (XAMPP + Node)
REM 1) Sets backend env vars
REM 2) Installs deps (backend + frontend)
REM 3) Creates/Resets MySQL DB (if mysql.exe is available)
REM 4) Builds backend and seeds default users
REM 5) Starts backend and frontend in separate windows

echo === GloBaPay one-click setup (Windows) ===

REM Locate repo root relative to this script
pushd %~dp0\..\
set "REPO_ROOT=%CD%"
set "BACKEND=%REPO_ROOT%\app_backend"

REM Step 1: Configure backend environment (PowerShell required)
echo.
echo [1/6] Setting backend environment variables...
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%BACKEND%\scripts\setup-env.ps1' -LoadCurrent -WriteDotEnv" || (
  echo Failed to set environment. && exit /b 1
)

REM Step 2: Install dependencies
echo.
echo [2/6] Installing backend dependencies...
pushd "%BACKEND%"
call npm install || (echo npm install failed && exit /b 1)
popd

echo [3/6] Installing frontend dependencies...
call npm install || (echo npm install (frontend) failed && exit /b 1)

REM Step 3: Ensure MySQL database exists (optional if mysql.exe present)
echo.
echo [4/6] Ensuring MySQL database (payment_portal)...
set "MYSQL_EXE=mysql"
if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_EXE=C:\xampp\mysql\bin\mysql.exe"
for %%I in (%MYSQL_EXE%) do set "MYSQL_FOUND=%%~$PATH:I"
if not "%MYSQL_FOUND%"=="" set "MYSQL_EXE=%MYSQL_FOUND%"

if exist "%MYSQL_EXE%" (
  echo Using MySQL client: %MYSQL_EXE%
  set "DB_HOST=%DB_HOST%"
  if "%DB_HOST%"=="" set "DB_HOST=localhost"
  set "DB_PORT=%DB_PORT%"
  if "%DB_PORT%"=="" set "DB_PORT=3306"
  set "DB_USER=%DB_USER%"
  if "%DB_USER%"=="" set "DB_USER=root"
  set "DB_PASSWORD=%DB_PASSWORD%"
  set "PWPART="
  if not "%DB_PASSWORD%"=="" set "PWPART=-p%DB_PASSWORD%"
  "%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PWPART% -e "DROP DATABASE IF EXISTS payment_portal; CREATE DATABASE payment_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || echo (MySQL step skipped or failed - continuing)
) else (
  echo MySQL client not found - skipping DB step. Ensure XAMPP MySQL is running and DB exists.
)

REM Step 4: Build backend and seed users
echo.
echo [5/6] Building backend (TypeScript -> dist)...
pushd "%BACKEND%"
call npm run build || (echo Backend build failed && exit /b 1)
echo Seeding default employees...
node .\scripts\seed-employees.js || echo (Seeding employees skipped or failed)
echo Seeding basic users...
node .\scripts\seed-initial.js || echo (Seeding initial users skipped or failed)
popd

REM Step 5: Start backend and frontend in new windows
echo.
echo [6/6] Starting backend and frontend...
start "GloBaPay Backend" cmd /k "cd /d %BACKEND% && npm run dev"
start "GloBaPay Frontend" cmd /k "cd /d %REPO_ROOT% && npm start"

echo.
echo Setup complete. Windows opened for backend (http://localhost:5000) and frontend (https://localhost:3000).
echo If MySQL wasn't found, create DB payment_portal manually or rerun after installing XAMPP.

popd
exit /b 0


