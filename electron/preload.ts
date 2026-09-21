import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('goalboard', {
  load: () => ipcRenderer.invoke('goals:load'),
  save: (data: unknown) => ipcRenderer.invoke('goals:save', data),
})
