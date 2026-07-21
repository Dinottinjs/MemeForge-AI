import { contextBridge, ipcRenderer, shell } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => {
    const validChannels = ['get-gpus', 'generate-local', 'download-file', 'copy-image']
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error('Invalid IPC channel'))
  },
  openExternal: (url: string) => {
    // Only allow http and https URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
  }
})
