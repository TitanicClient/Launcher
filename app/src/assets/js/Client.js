const child = require('child_process');

const defaultMinecraftPath = appdataPath(".minecraft");
const titanicPath = os.homedir() + "\\.titanicclient";

var selectedVersion = "b1.1_02";

const jrePath = titanicPath + `\\jre`
const versionsPath = titanicPath + "\\versions"
const currentVersionPath = versionsPath + "\\" + selectedVersion
const nativesPath = `${versionsPath}\\${selectedVersion}\\natives`
const clientJar = currentVersionPath + `\\Titanic-${selectedVersion}-all.jar`

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

function testLaunch() {
    var launchButton = document.querySelector('.launch-button');
    launchButton.classList.add('muted');
    launchButton.innerHTML = 'Launching...';
    
    var parameters = [
        "-Djava.library.path=" + nativesPath,
        "-jar " + clientJar,
        "Test"
    ];

    var command = "java";

    for (var index in parameters) {
        var parameter = parameters[index];
        command = command + " " + parameter;
    }

    console.log('command: ' + command);

    var process = child.exec(command);
    
    process.on('exit', function () {
        running = false;
        launchButton.classList.remove('muted');
        launchButton.innerHTML = 'Launch';
    });

    process.on('disconnect', function () {
        running = false;
        launchButton.classList.remove('muted');
        launchButton.innerHTML = 'Launch';
    });

    process.on('close', function () {
        running = false;
        launchButton.classList.remove('muted');
        launchButton.innerHTML = 'Launch';
    });
    
    process.on('error', function (error) {
        process.kill();
        console.log('Got error from child: ' + error);
        launchButton.classList.remove('muted');
        launchButton.classList.add('error');
        launchButton.innerHTML = 'Crashed';
    });
    
    process.on('message', function (m) {
        console.log('Got message from child: ' + m);
    });
}