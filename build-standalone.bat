@echo off
REM Build OCA Sana Hub Desktop Standalone Edition
REM This script builds the Windows desktop application

echo ================================================
echo OCA Sana Hub - Desktop Build Script
echo ================================================
echo.

echo [1/3] Checking dependencies...
if not exist "node_modules\electron" (
    echo Electron not found. Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies OK
)

echo.
echo [2/3] Building Next.js application...
call npm run standalone:export
if errorlevel 1 (
    echo ERROR: Failed to build Next.js app
    pause
    exit /b 1
)

echo.
echo [3/3] Creating Windows executable...
call npx electron-builder --win
if errorlevel 1 (
    echo ERROR: Failed to create executable
    pause
    exit /b 1
)

echo.
echo ================================================
echo BUILD COMPLETE!
echo ================================================
echo.
echo Your standalone desktop app is ready in:
echo   dist-electron\OCA Sana Hub Setup 1.0.0.exe (Installer)
echo   dist-electron\OCA Sana Hub 1.0.0.exe (Portable)
echo.
echo You can now share these files with your colleagues!
echo.
pause
