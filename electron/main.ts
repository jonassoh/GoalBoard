import { app, BrowserWindow, ipcMain } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

const isDev = !app.isPackaged

const dataFile = () => path.join(app.getPath('userData'), 'goalboard-data.json')

async function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f6f3ed',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) await window.loadURL('http://127.0.0.1:5173')
  else await window.loadFile(path.join(__dirname, '../dist/index.html'))
}

ipcMain.handle('goals:load', async () => {
  try {
    return JSON.parse(await fs.readFile(dataFile(), 'utf8'))
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error(error)
    return null
  }
})

ipcMain.handle('goals:save', async (_event, data: unknown) => {
  const file = dataFile()
  const temp = `${file}.tmp`
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(temp, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(temp, file)
  return true
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
