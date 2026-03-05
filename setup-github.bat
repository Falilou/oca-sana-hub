@echo off
REM ════════════════════════════════════════════════════════════════
REM   OCA SANA HUB - GitHub & Vercel Deployment Setup
REM   Windows Batch Script
REM ════════════════════════════════════════════════════════════════

cls
echo.
echo ════════════════════════════════════════════════════════════════
echo   OCA SANA HUB - GitHub Setup
echo ════════════════════════════════════════════════════════════════
echo.

echo Step 1: Initialize Git Repository
echo ───────────────────────────────────
git init

echo Step 2: Configure Git (optional - for commit messages)
echo ────────────────────────────────────────────────────
git config user.name "OCA Development Team"
git config user.email "dev@oca.com"

echo.
echo Step 3: Add all files
echo ──────────────────────
git add .

echo.
echo Step 4: Create initial commit  
echo ──────────────────────────────
git commit -m "OCA Sana Hub v1.1.0 - Enterprise Portal Management System"

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ Git repository initialized!
echo ════════════════════════════════════════════════════════════════
echo.
echo NEXT STEPS:
echo.
echo 1. Create GitHub Repository:
echo    - Go to https://github.com/new
echo    - Repository name: oca-sana-hub
echo    - Description: Enterprise Portal Management System
echo    - Public repository
echo    - Click "Create repository"
echo.
echo 2. Copy the repository URL (HTTPS)
echo.
echo 3. Run these commands in PowerShell:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/oca-sana-hub.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Deploy to Vercel:
echo    - Go to https://vercel.com/new
echo    - Import Git Repository
echo    - Select oca-sana-hub
echo    - Click Deploy
echo.
echo 5. Share your live URL with the team!
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
