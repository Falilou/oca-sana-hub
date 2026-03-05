#!/bin/bash
# Build OCA Sana Hub Desktop Standalone Edition
# This script builds the desktop application for macOS/Linux

set -e

echo "================================================"
echo "OCA Sana Hub - Desktop Build Script"
echo "================================================"
echo ""

echo "[1/3] Checking dependencies..."
if [ ! -d "node_modules/electron" ]; then
    echo "Electron not found. Installing dependencies..."
    npm install
else
    echo "Dependencies OK"
fi

echo ""
echo "[2/3] Building Next.js application..."
npm run standalone:export

echo ""
echo "[3/3] Creating executable..."

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Building for macOS..."
    npx electron-builder --mac
    echo ""
    echo "Your standalone desktop app is ready in:"
    echo "  dist-electron/OCA Sana Hub-1.0.0.dmg"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Building for Linux..."
    npx electron-builder --linux
    echo ""
    echo "Your standalone desktop app is ready in:"
    echo "  dist-electron/OCA Sana Hub-1.0.0.AppImage"
    echo "  dist-electron/oca-sana-hub_1.0.0_amd64.deb"
else
    echo "Unsupported platform: $OSTYPE"
    echo "Use build-standalone.bat for Windows"
    exit 1
fi

echo ""
echo "================================================"
echo "BUILD COMPLETE!"
echo "================================================"
echo ""
echo "You can now share these files with your colleagues!"
echo ""
