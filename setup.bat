@echo off
REM Quick Setup Script for Expense Tracker (Windows)

echo.
echo ==========================================
echo Expense Tracker - Quick Setup
echo ==========================================
echo.

REM Check PHP
php -v >nul 2>&1
if errorlevel 1 (
    echo X PHP is not installed. Please install PHP 7.4 or higher.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('php -v') do (
    set phpversion=%%i
    goto phpverdone
)
:phpverdone

echo [OK] PHP installed: %phpversion%

REM Check Composer
composer --version >nul 2>&1
if errorlevel 1 (
    echo X Composer is not installed. Please install Composer.
    echo Visit: https://getcomposer.org/download/
    pause
    exit /b 1
)

echo [OK] Composer installed

REM Install dependencies
echo.
echo Installing PHP dependencies...
call composer install

REM Create .env file
echo.
echo Setting up environment variables...

if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file from .env.example
    echo WARNING: Please edit .env and add your Supabase credentials:
    echo    - SUPABASE_URL
    echo    - SUPABASE_KEY
    echo    - SUPABASE_JWT_SECRET
) else (
    echo [OK] .env file already exists
)

echo.
echo ==========================================
echo [OK] Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Edit .env with your Supabase credentials
echo 2. Set up database schema (see DATABASE_SCHEMA.md)
echo 3. Configure CORS in Supabase (Settings ^> API ^> CORS)
echo 4. Start development server:
echo    cd public
echo    php -S localhost:8000
echo.
echo Then visit: http://localhost:8000
echo.
pause
