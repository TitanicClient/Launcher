const electron = require("electron");
const showdown = require("showdown"); // converter for markdown to html
const appdataPath = require('appdata-path');

const ipc = electron.ipcRenderer;
const DEBUG = false;
const CHANGELOG_URL =
  "https://raw.githubusercontent.com/TitanicClient/Assets/master/CHANGELOGS.md";

function onLoad() {
  loadTheme(); // load any theme overrides
  loadChangelog(); // load changelog
  loadServers(); // load featured servers
}

function sendToIPC(message) {
  ipc.send(message);
}

function loadLink(link) {
  electron.shell.openExternal(link);
}

function showPage(page) {
  var pages = ["home", "servers", "settings", "about"];

  document.getElementById(page).style.display = "block";

  for (let i = 0; i < pages.length; i++) {
    if (pages[i] == page) {
      continue;
    }
    document.getElementById(pages[i]).style.display = "none";
  }
}

function loadChangelog() {
  fetch(CHANGELOG_URL)
    .then((response) => response.text())
    .then((dataStr) => {
      var html = new showdown.Converter().makeHtml(dataStr);
      document.getElementById("changelogs-text").innerHTML = html;
    });
  setLaunchButtonToGreen(); // set to green by default
}

function loadServers() {
  fetch("https://noxiuam.cc/titanic-client/api/servers/server-index.json")
    .then((response) => response.json())
    .then((response) => {
      Object.keys(response).forEach(function (versionKey) {
        var version = response[versionKey];

        Object.keys(version).forEach(function (serverKey) {
          var motd = truncate(version[serverKey].motd, 45); // because i cba to put on a new line rn

          var serverElement = 
          `<div class="server">
                <img src="https://noxiuam.cc/titanic-client/api/servers/icons/${serverKey}.png" style="height: 85px; width: 85px;">
                <h1>${serverKey}</h1>
                <h3>${motd}</h3>
            </div>`;

          document.querySelector(".servers-wrapper").innerHTML += serverElement;
        });
      });
    });
}

function truncate(text, n) {
  return text.length > n ? text.slice(0, n - 1) + "..." : text;
}
