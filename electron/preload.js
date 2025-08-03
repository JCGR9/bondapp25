const { contextBridge, shell } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => {
    return shell.openExternal(url);
  },
  platform: process.platform,
  versions: process.versions,
});
