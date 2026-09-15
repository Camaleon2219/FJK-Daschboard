const { contextBridge } = require('electron');

// Expose safe desktop environment info if needed
contextBridge.exposeInMainWorld('electronDesktop', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});
