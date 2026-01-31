import { contextBridge, ipcRenderer } from 'electron'

// --------- Expose some API to the Renderer process ---------
// Only expose a minimal, restricted API to the renderer process.
// Generic access to ipcRenderer is disabled for security.
contextBridge.exposeInMainWorld('electronAPI', {
  // Add specific, safe IPC handlers here as needed.
  // Example: 
  // onMessage: (callback: any) => ipcRenderer.on('main-process-message', (_event, value) => callback(value)),
})

