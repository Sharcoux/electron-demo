require('hazardous')
const { ipcMain, systemPreferences, app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow
const isDev = process.env.node_env === 'development'

// const voskServiceRegister = require('./voskServiceIpc')
// voskServiceRegister()

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:9000'
      : `file://${path.join(__dirname, 'build/index.html')}`
  )
  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Request for authorization to use microphone
ipcMain.on('activate-microphone', (event) => {
  systemPreferences
    .askForMediaAccess('microphone')
    .then((result) => event.reply('activate-microphone-response', result))
})


app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
