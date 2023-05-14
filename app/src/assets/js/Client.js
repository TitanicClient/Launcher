const child = require("child_process");
const unzipper = require("unzipper");
const path = require("path");

const defaultMinecraftPath = appdataPath(".minecraft");
const titanicPath = os.homedir() + "\\.titanicclient";

var selectedVersion = "a1.2.6";

const jrePath = titanicPath + `\\jre`;
const versionsPath = titanicPath + "\\versions";
const currentVersionPath = versionsPath + "\\" + selectedVersion;
const nativesPath = `${versionsPath}\\${selectedVersion}\\natives`;

if (!fs.existsSync(titanicPath)) {
  fs.mkdirSync(titanicPath);
}

if (!fs.existsSync(versionsPath)) {
  fs.mkdirSync(versionsPath);
}

if (!fs.existsSync(currentVersionPath)) {
  fs.mkdirSync(currentVersionPath);
}

if (!fs.existsSync(jrePath)) {
  fs.mkdirSync(jrePath);
}

if (!fs.existsSync(nativesPath)) {
  fs.mkdirSync(nativesPath);
}

async function launch() {
  var launchButton = document.querySelector(".launch-button");
  launchButton.classList.add("muted");
  launchButton.innerHTML = "Launching...";

  const metadataUrl =
    "https://noxiuam.cc/titanic-client/api/launch/metadata.json";

  try {
    const response = await fetch(metadataUrl);
    const metadata = await response.json();

    console.log("[LAUNCH] Starting launch request..");

    const clientLink = metadata[selectedVersion].clientLink;
    const clientJarPath =
      currentVersionPath + `\\Titanic-${selectedVersion}-all.jar`;
    const clientJarExists = fs.existsSync(clientJarPath);
    const clientJarNeedsUpdate =
      !clientJarExists || (await needsUpdate(clientJarPath, clientLink));

    const nativesLink = metadata[selectedVersion].nativesLink;
    const nativesPath = `${versionsPath}\\${selectedVersion}\\natives`;
    const nativesExists = fs.existsSync(nativesPath);
    const nativesNeedUpdate =
      !nativesExists || (await needsUpdate(nativesPath, nativesLink));

    const jreZipPath = `${jrePath}.zip`;
    const jreExists = fs.existsSync(jrePath);
    const jreNeedsUpdate =
      !jreExists || (await needsUpdate(jrePath, metadata.jre));

    if (clientJarNeedsUpdate) {
      console.log("[LAUNCH] Updating client jar..");
      launchButton.innerHTML = "Updating..";
      await downloadFile(clientLink, clientJarPath);
    }

    if (nativesNeedUpdate) {
      console.log("[LAUNCH] Updating natives..");
      const zipPath = `${nativesPath}.zip`;
      await downloadFile(nativesLink, zipPath);
      await extractZip(zipPath, nativesPath);
      fs.unlinkSync(zipPath);
    }

    if (jreNeedsUpdate) {
      console.log("[LAUNCH] Updating jar..");
      launchButton.innerHTML = "Launching..";
      await downloadFile(metadata.jre, jreZipPath);
      await extractZip(jreZipPath, jrePath);
      fs.unlinkSync(jreZipPath);
    }

    if (!clientJarNeedsUpdate && !nativesNeedUpdate && !jreNeedsUpdate) {
      console.log("[LAUNCH] Starting launch process..");
      launchButton.innerHTML = "Launching..";
    }

    var parameters = [
      "-Djava.library.path=" + nativesPath,
      "-jar " + clientJarPath,
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

    process.on("exit", function () {
      console.log("[LAUNCH] Closed..");
      running = false;
      launchButton.classList.remove("muted");
      launchButton.innerHTML = "Launch";
    });

    process.on("disconnect", function () {
      running = false;
      launchButton.classList.remove("muted");
      launchButton.innerHTML = "Launch";
    });

    process.on("close", function () {
      running = false;
      launchButton.classList.remove("muted");
      launchButton.innerHTML = "Launch";
    });

    process.on("error", function (error) {
      process.kill();
      console.log("Got error from child: " + error);
      launchButton.classList.remove("muted");
      launchButton.innerHTML = "Crashed";
    });

    process.on("message", function (m) {
      console.log("Got message from child: " + m);
    });

    async function needsUpdate(filePath, url) {
      try {
        if (!url) {
          console.error(`URL is undefined for ${filePath}`);
          return false;
        }
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
          console.error(
            `Error checking update for ${filePath}: ${response.status} ${response.statusText}`
          );
          return false;
        }
        const remoteSize = response.headers.get("content-length");
        if (!fs.existsSync(filePath)) {
          return true;
        }
        const localSize = fs.statSync(filePath).size;
        return remoteSize !== localSize;
      } catch (error) {
        console.error(`Error checking update for ${filePath}: ${error}`);
        return false;
      }
    }

    async function downloadFile(url, filePath) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
    }

    async function extractZip(zipPath, extractPath) {
      const stream = fs.createReadStream(zipPath);
      await stream.pipe(unzipper.Extract({ path: extractPath })).promise();
    }
  } catch (error) {
    console.error(`Error launching client: ${error}`);
    launchButton.classList.remove("muted");
    launchButton.innerHTML = "Launch";
  }
}
