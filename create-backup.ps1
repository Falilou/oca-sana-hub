# ================================================================
# OCA Sana Hub - MVP Backup Script
# ================================================================
# Description: Creates a timestamped backup archive of the project
# Version: 1.0
# Date: February 22, 2026
# ================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  OCA Sana Hub - MVP Backup Tool" -ForegroundColor Cyan
Write-Host "  Version 1.0 - MVP Release" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$projectName = "oca_sana_hub_MVP_v1.0"
$backupName = "${projectName}_${timestamp}"

# Define paths
$projectRoot = $PSScriptRoot
$backupDir = Join-Path $projectRoot "backups"
$backupFile = Join-Path $backupDir "${backupName}.zip"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "[+] Created backup directory: $backupDir" -ForegroundColor Green
}

Write-Host "[*] Preparing backup..." -ForegroundColor Yellow
Write-Host ""

# List of files/folders to exclude
$excludePatterns = @(
    "node_modules",
    ".next",
    "backups",
    ".git",
    ".env.local",
    ".env",
    "*.log",
    "*.swap",
    "*.swp",
    ".DS_Store",
    "Thumbs.db",
    "*.tmp",
    "dist",
    "build",
    "coverage"
)

Write-Host "[*] Files/folders excluded from backup:" -ForegroundColor Yellow
$excludePatterns | ForEach-Object { Write-Host "    - $_" -ForegroundColor Gray }
Write-Host ""

# Create temporary directory for staging
$tempDir = Join-Path $env:TEMP $backupName
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "[*] Copying files to staging area..." -ForegroundColor Yellow

# Copy files excluding patterns
Get-ChildItem -Path $projectRoot -Recurse | Where-Object {
    $item = $_
    $relativePath = $item.FullName.Substring($projectRoot.Length + 1)
    
    # Exclude items matching patterns
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($projectRoot.Length + 1)
    $targetPath = Join-Path $tempDir $relativePath
    
    if ($_.PSIsContainer) {
        if (-not (Test-Path $targetPath)) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        }
    } else {
        $targetDir = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
}

Write-Host "[+] Files copied successfully" -ForegroundColor Green
Write-Host ""

# Create README for the backup
$backupReadme = @"
# OCA Sana Hub - MVP v1.0 Backup
Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## What's Included
This backup contains the complete MVP version 1.0 of OCA Sana Hub.

## Contents
- Source code (`src/` directory)
- Documentation (`docs/` directory)
- Configuration files
- Package definitions
- Static assets
- Version information

## Excluded
- node_modules (reinstall with: npm install)
- .next build directory (rebuild with: npm run build)
- Environment files (.env.local - create from .env.example)
- Log files and temporary files

## Restoration Steps

1. Extract this archive to your desired location
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create environment file:
   ```bash
   copy .env.example .env.local
   # Edit .env.local with your configuration
   ```
5. Start development server:
   ```bash
   npm run dev
   ```
   OR build for production:
   ```bash
   npm run build
   npm start
   ```

## Documentation
- See VERSION.md for version details
- See RELEASE_NOTES.md for changelog
- See docs/README.md for complete documentation

## Support
Refer to the documentation in the docs/ directory for setup instructions and troubleshooting.

---
Backup created with OCA Sana Hub Backup Tool v1.0
"@

$backupReadme | Out-File -FilePath (Join-Path $tempDir "BACKUP_README.txt") -Encoding UTF8

Write-Host "[*] Creating ZIP archive..." -ForegroundColor Yellow

# Create ZIP archive
try {
    Compress-Archive -Path "$tempDir\*" -DestinationPath $backupFile -CompressionLevel Optimal -Force
    Write-Host "[+] Archive created successfully!" -ForegroundColor Green
} catch {
    Write-Host "[!] Error creating archive: $_" -ForegroundColor Red
    exit 1
}

# Clean up temporary directory
Remove-Item -Path $tempDir -Recurse -Force

# Get file size
$fileSize = (Get-Item $backupFile).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Backup Completed Successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backup Details:" -ForegroundColor Cyan
Write-Host "  Location: $backupFile" -ForegroundColor White
Write-Host "  Size: $fileSizeMB MB" -ForegroundColor White
Write-Host "  Timestamp: $timestamp" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Store this backup in a safe location" -ForegroundColor White
Write-Host "  2. Consider uploading to cloud storage or version control" -ForegroundColor White
Write-Host "  3. Test restoration on a different machine" -ForegroundColor White
Write-Host ""
Write-Host "To restore, simply extract the ZIP file and run:" -ForegroundColor Cyan
Write-Host "  npm install" -ForegroundColor White
Write-Host ""

# Open backup directory
Write-Host "[*] Opening backup directory..." -ForegroundColor Yellow
Start-Process "explorer.exe" -ArgumentList $backupDir

Write-Host "Done! 🚀" -ForegroundColor Green
