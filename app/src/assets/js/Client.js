const child = require("child_process");
const unzipper = require("unzipper");
const path = require("path");
const os = require("os");
const fs = require("fs");

const titanicPath = path.join(os.homedir(), ".titanicclient");
let selectedVersion = "b1.1_02"; // Default version

const jrePath = path.join(titanicPath, "jre");
const versionsPath = path.join(titanicPath, "versions");
const currentVersionPath = path.join(versionsPath, selectedVersion);
const nativesPath = path.join(currentVersionPath, "natives");

let isClientRunning = false;

if (!fs.existsSync(titanicPath)) {
  // Create parent directory
  fs.mkdirSync(titanicPath);
}

function createDirectories(dirs) {
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

function setButtonStatus(button, text, muted) {
  button.innerHTML = text;
  button.classList[muted ? "add" : "remove"]("muted");
}

function createUpdater(url, filePath, extractPath, isZip) {
  return {
    url,
    filePath,
    extractPath,
    isZip,
    async update() {
      if (!(await this.needsUpdate())) return false;
      await this.download();
      if (this.isZip) {
        await this.extract();
      }
      return true;
    },

    async needsUpdate() {
      try {
        const response = await fetch(this.url, { method: "HEAD" });
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        const remoteSize = response.headers.get("content-length");
        if (!fs.existsSync(this.filePath)) {
          return true;
        }
        const localSize = fs.statSync(this.filePath).size;
        return remoteSize !== localSize;
      } catch (error) {
        console.error(`Error checking update for ${this.filePath}: ${error}`);
        return false;
      }
    },

    async download() {
      const response = await fetch(this.url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(this.filePath, Buffer.from(buffer));
    },
    async extract() {
      const stream = fs.createReadStream(this.filePath);
      await stream.pipe(unzipper.Extract({ path: this.extractPath })).promise();
      fs.unlinkSync(this.filePath);
    },
  };
}

async function installFiles() {
  try {
    const metadataUrl =
      "https://noxiuam.cc/titanic-client/api/launch/metadata.json";
    const metadata = await fetchJson(metadataUrl);

    const client = createUpdater(
      metadata[selectedVersion].clientLink,
      path.join(currentVersionPath, `Titanic-${selectedVersion}-all.jar`)
    );
    const natives = createUpdater(
      metadata[selectedVersion].nativesLink,
      path.join(nativesPath, ".temp.zip"),
      nativesPath,
      true
    );
    const jre = createUpdater(
      metadata.jre,
      path.join(jrePath, ".temp.zip"),
      jrePath,
      true
    );

    await Promise.all([client.update(), natives.update(), jre.update()]);
  } catch (error) {
    console.error(`Error installing files: ${error}`);
  }
}

async function launchClient() {
  if (isClientRunning) {
    return;
  }

  const launchButton = document.querySelector(".launch-button");
  setButtonStatus(launchButton, "Downloading...", true);

  try {
    // Check if the user has the necessary files and directories
    let needsInstall = false;
    if (!fs.existsSync(titanicPath)) {
      fs.mkdirSync(titanicPath);
    }
    if (
      !fs.existsSync(
        path.join(currentVersionPath, `Titanic-${selectedVersion}-all.jar`)
      ) ||
      !fs.existsSync(nativesPath) ||
      !fs.existsSync(path.join(nativesPath, "lwjgl.dll")) ||
      !fs.existsSync(jrePath) ||
      !fs.existsSync(path.join(jrePath, "bin", "javaw.exe"))
    ) {
      needsInstall = true;
      createDirectories([
        jrePath,
        versionsPath,
        currentVersionPath,
        nativesPath,
      ]);
      await installFiles();
    }

    if (needsInstall) {
      setButtonStatus(launchButton, "Validating...", true);
      await installFiles();
    }

    const usernameInput = document.querySelector(".launch-username");
    if (!usernameInput.value) {
      alert("Please enter a username to launch the client.");
      setButtonStatus(launchButton, "Launch", false);
      return;
    }

    launchGame(usernameInput.value);
  } catch (error) {
    console.error(`Error launching client: ${error}`);
    setButtonStatus(launchButton, "Launch", false);
    isClientRunning = false;
  }
}

function launchGame(username) {
  const launchButton = document.querySelector(".launch-button");
  setButtonStatus(launchButton, "Launched", true);

  const parameters = [
    "-Djava.library.path=" + nativesPath,
    "-jar " + currentVersionPath + "\\Titanic-" + selectedVersion + "-all.jar",
    username,
    "-javaagent:" + jrePath + "\\bin\\javaw.exe",
  ];

  const command = "java " + parameters.join(" ");

  console.log("command: " + command);

  const process = child.exec(command);

  isClientRunning = true;

  process.stdout.on("data", (data) => {
    console.log(`[Minecraft] ${data}`);
  });

  process.stderr.on("data", (data) => {
    console.error(`[Minecraft] ${data}`);
  });

  process.on("exit", () => {
    setButtonStatus(launchButton, "Launch", false);
    isClientRunning = false;
  });
  process.on("disconnect", () => {
    setButtonStatus(launchButton, "Launch", false);
    isClientRunning = false;
  });
  process.on("close", () => {
    setButtonStatus(launchButton, "Launch", false);
    isClientRunning = false;
  });
  process.on("error", (error) => {
    console.error(`Got error from child: ${error}`);
    setButtonStatus(launchButton, "Launch", false);
    isClientRunning = false;
  });
}

const launchButton = document.querySelector(".launch-button");
launchButton.addEventListener("click", launchClient);

async function updateVersionSelect() {
  const metadataUrl =
    "https://noxiuam.cc/titanic-client/api/launch/metadata.json";
  const metadata = await fetchJson(metadataUrl);
  const versionsSelect = document.querySelector(".launch-versions");
  versionsSelect.innerHTML = "";
  for (const version in metadata) {
    if (version !== "jre") {
      const option = document.createElement("option");
      option.value = version;
      option.appendChild(document.createTextNode(version));
      versionsSelect.appendChild(option);
    }
    versionsSelect.value = selectedVersion;
  }
}

async function updateVersion() {
  selectedVersion = document.querySelector(".launch-versions").value;
  const launchButton = document.querySelector(".launch-button");
  setButtonStatus(launchButton, "Launch", false);
  isClientRunning = false;
}

const versionsSelect = document.querySelector(".launch-versions");
versionsSelect.addEventListener("change", updateVersion);

(async function () {
  await updateVersionSelect();
  await updateVersion();
})();

module.exports = {
  createDirectories,
  fetchJson,
  setButtonStatus,
  createUpdater,
  installFiles,
  launchGame,
  launchClient,
  updateVersionSelect,
  updateVersion,
};
