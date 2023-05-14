let rootStyle = document.querySelector(":root");
let computedRoot = getComputedStyle(rootStyle);

const launchGreen = computedRoot.getPropertyValue("--launch-green");
const launchGray = computedRoot.getPropertyValue("--launch-gray");
const launchRed = computedRoot.getPropertyValue("--launch-red");

function setLaunchButtonToGreen() {
    rootStyle.style.setProperty("--launch-color", launchGreen);
}

function setLaunchButtonToGray() {
    rootStyle.style.setProperty("--launch-color", launchGray);
}

function setLaunchButtonToRed() {
    rootStyle.style.setProperty("--launch-color", launchRed);
}