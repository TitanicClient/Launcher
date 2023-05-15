const child = require("child_process");
const unzipper = require("unzipper");
const path = require("path");
const os = require("os");
const fs = require("fs");

const titanicPath = path.join(os.homedir(), ".titanicclient");
const selectedVersion = "a1.2.6";

const jrePath = path.join(titanicPath, "jre");
const versionsPath = path.join(titanicPath, "versions");
const currentVersionPath = path.join(versionsPath, selectedVersion);
const nativesPath = path.join(currentVersionPath, "natives");

if (!fs.existsSync(titanicPath)) {
  // Create necessary directories
  createDirectories([
    titanicPath,
    versionsPath,
    currentVersionPath,
    jrePath,
    nativesPath,
  ]);

  // Install required files
  installFiles();
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

function handleProcessEvents(button, buttonText) {
  setButtonStatus(button, buttonText, true);
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

async function testLaunch() {
  const launchButton = document.querySelector(".launch-button");
  setButtonStatus(launchButton, "Launching...", true);

  try {
    // Check if the user does not have files
    if (
      !fs.existsSync(path.join(currentVersionPath, `Titanic-${selectedVersion}-all.jar`)) ||
      !fs.existsSync(path.join(nativesPath, "lwjgl.dll")) ||
      !fs.existsSync(path.join(jrePath, "bin", "javaw.exe"))
    ) {
      console.log("Missing files detected, installing...");
      await installFiles();
    }

    const metadataUrl =
      "https://noxiuam.cc/titanic-client/api/launch/metadata.json";
    const metadata = await fetchJson(metadataUrl);

    var parameters = [
      "-Djava.library.path=" + nativesPath,
      "-jar " +
        currentVersionPath +
        "\\Titanic-" +
        selectedVersion +
        "-all.jar",
      "-javaagent:" + jrePath + "\\bin\\javaw.exe",
      "HS50",
    ];

    var command = "java";

    for (var index in parameters) {
      var parameter = parameters[index];
      command = command + " " + parameter;
    }

    console.log("command: " + command);

    var process = child.exec(command);

    process.on("spawn", () => {
      setButtonStatus(launchButton, "Launched", true);
    })

    process.on("exit", () => {
      setButtonStatus(launchButton, "Launch", false);
    });
    process.on("disconnect", () => setButtonStatus(launchButton, "Launch", false));
    process.on("close", () => {
      setButtonStatus(launchButton, "Launch", false);
    });
    process.on("error", (error) => {
      console.error(`Got error from child: ${error}`);
      setButtonStatus(launchButton, "Launch", false);
    });
  } catch (error) {
    console.error(`Error launching client: ${error}`);
    setButtonStatus(launchButton, "Launch", false);
  }
}

testLaunch();