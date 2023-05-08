let mainWindow;

const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { autoUpdater } = require("electron-updater")

const url = "https://github.com/TitanicClient/Launcher"
autoUpdater.setFeedURL({
    provider: "github", url,
    repo: "Launcher",
    owner: "TitanicClient"
})

setInterval(() => {
  //autoUpdater.checkForUpdates()
}, 60000);

app.on('ready', () => {
  
    mainWindow = new BrowserWindow({
        width: 1175,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
        center: true,
        maximizable: false,
        titleBarStyle: false,
        frame: false,
        show: false,
        resizable: false,
        fullscreen: false,
        icon: "./src/img/icons/logo.png",
        title: "Titanic Client",
        show: false
    });
    
    mainWindow.loadURL(`file://${__dirname}/launcher/index.html`);

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
});

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