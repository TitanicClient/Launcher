let rootStyle = document.querySelector(":root");
let computedRoot = getComputedStyle(rootStyle);

const launchGreen = rootStyle.getPropertyValue("--launch-green");
const launchGray = rootStyle.getPropertyValue("--launch-gray");
const launchPurple = rootStyle.getPropertyValue("--launch-purple");
const launchRed = rootStyle.getPropertyValue("--launch-red");

function setLaunchButtonToGreen() {
    root.style.setProperty("--launch-color", launchGreen);
}

function setLaunchButtonToGray() {
    root.style.setProperty("--launch-color", launchGray);
}

function setLaunchButtonToPurple() {
    root.style.setProperty("--launch-color", launchPurple);
}

function setLaunchButtonToRed() {
    root.style.setProperty("--launch-color", launchRed);
}