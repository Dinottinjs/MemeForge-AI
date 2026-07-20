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
      nodeIntegration: true,
      contextIsolation: false
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
    const scriptPath = path.join(__dirname, '../../local_generator.py')
    exec(`python "${scriptPath}" "${prompt}" "${gpuModel}"`, (err, stdout, stderr) => {
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
