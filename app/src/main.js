let mainWindow;
let loadingWindow;

const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')

const electronReload = require('electron-reload');
electronReload(__dirname, {})

const url = "https://github.com/TitanicClient/Launcher"

autoUpdater.setFeedURL({
  provider: "github", url,
  repo: "Launcher",
  owner: "TitanicClient"
})

setInterval(() => {
//autoUpdater.checkForUpdates()
}, 60000);


autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Launcher Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the launcher to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  console.error('There was a problem updating the launcher')
  console.error()
})

app.on('ready', () => {
  
  // Create the loading window
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 500,
    'backgroundColor': '#111111',
    resizable: false,
    center: true,
    frame: false,
    alwaysOnTop: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  loadingWindow.loadURL(`file://${__dirname}/loading.html`);

  // Create the main window
  mainWindow = new BrowserWindow({
    width: 1175,
    height: 700,
    'minWidth': 1175,
    'minHeight': 700,
    'backgroundColor': '#111111',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    menubar: false,
    center: true,
    titleBarStyle: false,
    frame: true,
    show: false,
    resizable: true,
    fullscreen: false,
    icon: "./launcher/assets/img/logo/logo-no-bg.png",
    title: "Titanic Client",
  });

  mainWindow.setMenuBarVisibility(false)

  // Load the main window content
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Show the loading window
  loadingWindow.show();

  setTimeout(() => {
    loadingWindow.close();
    mainWindow.show();
  }, 3200);
});

ipcMain.on('minimize', function() {
  mainWindow.minimize();
});

ipcMain.on('close', function() {
  mainWindow.close();
});

ipcMain.on('hide-to-tray', function() {
  mainWindow.hide();
});

ipcMain.on('show-launcher', function() {
  mainWindow.show();
});