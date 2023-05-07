const electron = require('electron');
const ipc = electron.ipcRenderer;

const DEBUG = false;

function onLoad() {
    loadTheme(); // load any theme overrides
}

function sendToIPC(message) {
    ipc.send(message);
}