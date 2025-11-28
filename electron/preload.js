// Preload script - Bridge between main and renderer
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electron', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  toggleAlwaysOnTop: (enabled) => ipcRenderer.invoke('toggle-always-on-top', enabled),
  captureScreen: () => ipcRenderer.invoke('capture-screen'), // New method
  onTriggerManualCapture: (callback) => ipcRenderer.on('trigger-manual-capture', callback),
  resizeWindow: (bounds) => ipcRenderer.invoke('resize-window', bounds),
  getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
});

console.log('✅ Preload script loaded');
