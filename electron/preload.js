/**
 * Electron Preload Script
 * Safely expose APIs to the renderer process
 */

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// limited electron APIs without exposing the entire electron module
contextBridge.exposeInMainWorld('electron', {
  isDesktop: true,
  platform: process.platform,
});
