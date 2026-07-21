import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import si from 'systeminformation'
import { exec } from 'child_process'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  // In production, load the built HTML. In dev, load localhost from Vite.
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:5173')
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers for Local Hardware & Generation
ipcMain.handle('get-gpus', async () => {
  try {
    const graphics = await si.graphics()
    return graphics.controllers.map(c => ({
      vendor: c.vendor,
      model: c.model,
      vram: c.vram
    }))
  } catch (e) {
    return []
  }
})

ipcMain.handle('generate-local', async (event, prompt: string, gpuModel: string) => {
  return new Promise((resolve) => {
    // execute local python dummy generator
    const scriptPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'local_image_generator.py')
      : path.join(__dirname, '../local_image_generator.py')
    const { execFile } = require('child_process')
    execFile('python', [scriptPath, prompt, gpuModel], (err: any, stdout: string, stderr: string) => {
      if (err) {
        resolve({ error: 'Fehler beim lokalen Rendern' })
      } else {
        try {
          resolve(JSON.parse(stdout))
        } catch {
          resolve({ error: 'Ungültige Antwort von lokaler Python-Engine' })
        }
      }
    })
  })
})

ipcMain.handle('download-file', async (event, url: string, defaultFilename: string) => {
  const { dialog } = require('electron')
  const fs = require('fs')
  
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Bild speichern',
    defaultPath: defaultFilename || 'meme.png',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
  })
  
  if (canceled || !filePath) return false

  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(buffer))
    return true
  } catch (e) {
    return false
  }
})

ipcMain.handle('copy-image', async (event, url: string) => {
  const { clipboard, nativeImage } = require('electron')
  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const image = nativeImage.createFromBuffer(Buffer.from(buffer))
    clipboard.writeImage(image)
    return true
  } catch (e) {
    return false
  }
})
