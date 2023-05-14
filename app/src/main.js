let mainWindow;

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
  
    mainWindow = new BrowserWindow({
        width: 1175,
        height: 700,
        'minWidth': 1175,
        'minHeight': 700,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
        menubar: false,
        center: true,
        titleBarStyle: false,
        frame: true,
        show: true,
        resizable: true,
        fullscreen: false,
        icon: "./launcher/assets/img/logo/logo-no-bg.png",
        title: "Titanic Client",
    });

    mainWindow.setMenuBarVisibility(false)
    
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
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