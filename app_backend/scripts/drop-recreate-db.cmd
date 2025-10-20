@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Configuration (env vars optional)
set "DB_NAME=%DB_NAME%"
if "%DB_NAME%"=="" set "DB_NAME=payment_portal"

set "DB_HOST=%DB_HOST%"
if "%DB_HOST%"=="" set "DB_HOST=localhost"

set "DB_PORT=%DB_PORT%"
if "%DB_PORT%"=="" set "DB_PORT=3306"

set "DB_USER=%DB_USER%"
if "%DB_USER%"=="" set "DB_USER=root"

set "DB_PASSWORD=%DB_PASSWORD%"

REM Locate mysql.exe (prefer XAMPP path, fallback to PATH)
set "MYSQL_EXE=mysql"
if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_EXE=C:\xampp\mysql\bin\mysql.exe"

REM Build password part (no space between -p and password)
set "PWPART="
if not "%DB_PASSWORD%"=="" set "PWPART=-p%DB_PASSWORD%"

echo Dropping database "%DB_NAME%" on %DB_HOST%:%DB_PORT% as %DB_USER% ...
"%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PWPART% -e "DROP DATABASE IF EXISTS %DB_NAME%;"
if errorlevel 1 (
  echo ERROR: Failed to drop database.
  exit /b 1
)

echo Creating database "%DB_NAME%" ...
"%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PWPART% -e "CREATE DATABASE %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
  echo ERROR: Failed to create database.
  exit /b 1
)

echo Done.
exit /b 0


