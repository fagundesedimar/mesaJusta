const { contextBridge, shell } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => process.versions.electron,
  openExternal: (url) => shell.openExternal(url),
})
