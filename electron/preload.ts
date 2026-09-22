import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('goalboard', {
  load: (accountId: string) => ipcRenderer.invoke('goals:load', accountId),
  save: (accountId: string, data: unknown) => ipcRenderer.invoke('goals:save', accountId, data),
})
