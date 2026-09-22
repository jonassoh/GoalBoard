import { app, BrowserWindow, ipcMain } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

const isDev = !app.isPackaged

const dataFile = (accountId: string) => {
  const safeAccountId = accountId.replace(/[^a-zA-Z0-9_-]/g, '')
  return path.join(app.getPath('userData'), `goalboard-data-${safeAccountId}.json`)
}

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

ipcMain.handle('goals:load', async (_event, accountId: string) => {
  const accountFile = dataFile(accountId)
  try {
    return JSON.parse(await fs.readFile(accountFile, 'utf8'))
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(error)
      return null
    }
    try {
      const legacyFile = path.join(app.getPath('userData'), 'goalboard-data.json')
      const legacyData = await fs.readFile(legacyFile, 'utf8')
      await fs.rename(legacyFile, accountFile)
      return JSON.parse(legacyData)
    } catch (legacyError: unknown) {
      if ((legacyError as NodeJS.ErrnoException).code !== 'ENOENT') console.error(legacyError)
      return null
    }
  }
})

ipcMain.handle('goals:save', async (_event, accountId: string, data: unknown) => {
  const file = dataFile(accountId)
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
