/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/

const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort } = require('serialport');
const path = require('path');
const url = require('url');
const fs = require('fs');
const utils = require('./utils.js');

/* --- CONFIG FILE HANDLING --- */

var config;

function getConfigFromFile() {
  let filePath = './config.json';
  // This is a temporary solution to read/write to the config file after building, will later change to relative paths
  if (!fs.existsSync(filePath)) {
    filePath = './resources/app/config.json';
  }
  let rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

function setConfig(newConfig) {
  let filePath = './config.json';
  // This is a temporary solution to read/write to the config file after building, will later change to relative paths
  if (!fs.existsSync(filePath)) {
    filePath = './resources/app/config.json';
  }
  fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2));
}

ipcMain.handle('getConfig', () => config);

ipcMain.on('setConfigAndRestart', (event, config) => {
  setConfig(config);
  app.relaunch();
  app.exit();
});

/* --- SETTING CONFIG --- */

config = getConfigFromFile();
const INTERVAL_UPDATE_TIMER = config.intervals.updateTimer;
const INTERVAL_CHECK_SERIAL_CONNECTION = config.intervals.checkSerialConnection;
const INTERVAL_PRINT_ATTEMPT_CHANGES = config.intervals.printAttemptChanges;
const INTERVAL_CHECK_SHOW_LIGHTS = config.intervals.checkShowLights;

/* --- SERIAL PORT COMMUNICATION (for speaking to the router) --- */

var serialPortName = ''; // "COM4", "COM6" etc
var serialPort = null; // SerialPort object

function tryDetectPort() {
  return new Promise(async function (resolve, reject) {
    await SerialPort.list().then((ports, err) => {
      if (err) {
        reject(err);
        return;
      } else {
        ports.forEach((port) => {
          if (port.friendlyName.includes('CP210x')) {
            resolve(port.path);
            return;
          }
        });
        resolve('');
        return;
      }
    });
  });
}

/* Sets up the listeners for serial communications */
function setupSerialPort() {
  serialPort.on('open', function () {
    console.log('Serial connection with router is open');

    // On first connection we always get the current state of referee decisions, and the network info
    requestStatus();
    setTimeout(requestNetworkInfo, config.intervals.requestNetworkInfo);

    serialPort.on('data', function (data) {
      if (config.debugSerial) {
        console.log('Incoming serial data: ' + data);
      }

      // Everything coming from the serial port must be wrapped between '|S|' and '|E|' to be valid. Examples:
      // |S|err|Failed to setup mDNS|E|
      // |S|msg|Setup complete|E|
      // |S|l0001c1000r0110|E|
      // Anything else should be considered garbage data.
      const PATTERN = /\|S\|(?<message>.+?)\|E\|/i;
      let found = data.toString().match(PATTERN);

      if (found) {
        let message = found.groups['message'];

        // Errors coming from the router
        if (message.includes('err|')) {
          handleSerialError(message);
        }
        // Other messages coming from the router
        else if (message.includes('msg|')) {
          logSerialMessage(message);
        }
        // Receiving the network connection info (SSID, password, URL etc)
        else if (message.includes('network|')) {
          setNetworkConnectionInfo(message);
        }
        // Simplified timer controls from the chief referee
        // Format: timer|rp|60000
        else if (message.includes('timer|')) {
          message = message.substring(6);
          let command = message.substring(0, message.indexOf('|'));
          let millis = message.substring(message.indexOf('|') + 1);
          switch (command) {
            case 'rp': // restart and play
              startNewTimer(parseInt(millis));
              playTimer(parseInt(millis));
              break;
          }
        }
        // Referee decisions (main communication)
        // Format: l0000c0000r0000
        else if (message.length == 15 && !lock) {
          updateDecisions(message.split(''));
        }
      }
    });
  });
}

function handleSerialError(error) {
  // TODO: log to in-application console on Settings screen
  console.log(error);
}

function logSerialMessage(message) {
  // TODO: log to in-application console on Settings screen
  console.log(message);
}

/* Checks if router is connected */
async function checkSerialConnection() {
  let newSerialPortName;
  if (config.useSpecificComPort) {
    newSerialPortName = config.specificComPort;
  } else {
    newSerialPortName = await tryDetectPort();
  }

  // If the COM port has changed (or is connecting for the first time, or has disconnected)
  // we setup the serial port object and its listeners
  if (newSerialPortName != serialPortName) {
    serialPortName = newSerialPortName;

    if (serialPortName === '') {
      console.log('Router disconnected');
      serialPort = null;
    } else {
      console.log('Router connected');
      serialPort = new SerialPort({
        path: serialPortName,
        baudRate: 115200,
      });
      setupSerialPort();
    }
  }

  // We inform the dashboard of the current connection status
  try {
    if (serialPort === null) {
      dashboardWindow.webContents.send('connectionStatus', false);
    } else {
      dashboardWindow.webContents.send('connectionStatus', true);
    }
  } catch (e) {}
}

function clearAll() {
  serialPort.write('clear');
}

function requestStatus() {
  serialPort.write('status');
}

function requestNetworkInfo() {
  serialPort.write('network');
}

/* --- TIMER AND RELATED CONTROLS --- */

const enums = require('./ui/enums.js');
const TIMER_STATUSES = enums.TIMER_STATUSES;
var currentTimerStatus = TIMER_STATUSES.STOPPED;
var timerText = '00:00';

var startTime = null;
var goalTime = null;
var remainingTimeBeforePause = 0;

function playTimer(millis) {
  switch (currentTimerStatus) {
    case TIMER_STATUSES.STOPPED:
      startNewTimer(millis);
      updateTimerStatus(TIMER_STATUSES.RUNNING);
      break;
    case TIMER_STATUSES.EXPIRED:
      startNewTimer(millis);
      updateTimerStatus(TIMER_STATUSES.RUNNING);
      break;
    case TIMER_STATUSES.PAUSED:
      updateTimerStatus(TIMER_STATUSES.RUNNING);
      goalTime = Date.now() + remainingTimeBeforePause;
      break;
    case TIMER_STATUSES.RUNNING:
      return;
  }
}

function startNewTimer(millis) {
  setTimer(millis);
  updateTimerStatus(TIMER_STATUSES.STOPPED);
}

function pauseTimer() {
  if (currentTimerStatus === TIMER_STATUSES.PAUSED) {
    return;
  }
  updateTimerStatus(TIMER_STATUSES.PAUSED);
  remainingTimeBeforePause = goalTime - Date.now();
}

function setTimer(millis) {
  if (millis < 0) {
    return;
  }
  timerText = formatTimerText(millis);

  startTime = new Date();
  goalTime = new Date(startTime.getTime() + millis);
}

function updateTimerText() {
  if (currentTimerStatus !== TIMER_STATUSES.RUNNING) {
    return timerText;
  }

  let currentTime = Date.now();
  if (!goalTime) {
    goalTime = 0;
  }

  // Reaching '00:00'
  if (goalTime - currentTime < 1000) {
    updateTimerStatus(TIMER_STATUSES.EXPIRED);
    timerText = formatTimerText(0);
    return timerText;
  }

  let remainingTime = goalTime - currentTime;
  timerText = formatTimerText(remainingTime);
  return timerText;
}

function formatTimerText(remainingMillis) {
  let date = new Date(remainingMillis);

  let minutesDisplay = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  let secondsDisplay = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();

  let millisecondsDisplay = '';
  if (config.showMilliseconds) {
    let truncatedMillis = Math.floor(date.getMilliseconds() / 10);
    millisecondsDisplay = '.' + ('00' + truncatedMillis).slice(-2);
  }

  return minutesDisplay + ':' + secondsDisplay + millisecondsDisplay;
}

function updateTimerStatus(status) {
  currentTimerStatus = status;

  resultsWindow.webContents.send('updateTimerStatus', currentTimerStatus);
  dashboardWindow.webContents.send('updateTimerStatus', currentTimerStatus);
  if (miniTimerWindow) {
    miniTimerWindow.webContents.send('updateTimerStatus', currentTimerStatus);
  }
}

function handleTimer() {
  let timerText = updateTimerText();
  try {
    resultsWindow.webContents.send('updateTimer', timerText);
    dashboardWindow.webContents.send('updateTimer', timerText);
    if (miniTimerWindow) {
      miniTimerWindow.webContents.send('updateTimer', timerText);
    }
  } catch (e) {}
}

/* --- ATTEMPT CHANGES --- */

const TIME_CHANGE_ATTEMPT = 60;

// We keep a list that contains an ID for the attempt, the time remaining on it, and the ID of its
// corresponding interval for cleaning it up later
var attemptChanges = [];
var incrementalAttemptId = 0;

function createAttemptChangeTimer() {
  attemptChanges.push({
    id: incrementalAttemptId++,
    time: TIME_CHANGE_ATTEMPT,
    intervalId: null,
  });
  let id = attemptChanges[attemptChanges.length - 1].id;

  // Each attempt change will have its own interval to ensure
  // it's independent of the printing interval
  let intervalId = setInterval(function () {
    for (let i = attemptChanges.length - 1; i >= 0; i--) {
      if (attemptChanges[i].id === id) {
        // Decrement one second on the timer
        attemptChanges[i].time--;
        // If the timer is over...
        if (attemptChanges[i].time <= 0) {
          clearInterval(attemptChanges[i].intervalId); // ... we clean up its interval...
          attemptChanges.splice(i, 1); // and remove the timer from the list
        }
        break;
      }
    }
  }, 1000);

  // Insert the newly created interval on the list's latest attempt
  attemptChanges[attemptChanges.length - 1].intervalId = intervalId;
}

// The attempt change timer gradually goes from green to red as time runs out. For performance optimization
// we read it from a constant list of 60 color values rather than polling the hex code in real time
const COLORS = require('./ui/colors.js');

/* Printing all current attempt change times in a colored, ready-to-display mannter */
function printAttemptChanges() {
  let text = '';
  for (let i = 0; i < attemptChanges.length; i++) {
    text += '<span style="color: ' + COLORS.ATTEMPT_CHANGE[60 - attemptChanges[i].time] + '">' + attemptChanges[i].time + '</span>';
    if (i < attemptChanges.length - 1) {
      text += ' | ';
    }
  }

  try {
    resultsWindow.webContents.send('updateAttempts', text);
    dashboardWindow.webContents.send('updateAttempts', text);
  } catch (e) {}
}

/* --- REFEREE LIGHTS --- */

const TIME_SHOWING_LIGHTS = 7000;
const TIME_FOR_DECISION = 750;

var lock = false;

var timeShowDecision = 0;

// Referee decision format: white button, red button, blue button, yellow button
var leftReferee = ['0', '0', '0', '0'];
var centerReferee = ['0', '0', '0', '0'];
var rightReferee = ['0', '0', '0', '0'];

function showLights() {
  // Once it's time to show the lights, we 'lock' to ignore any referee button presses while lights are being shown
  lock = true;

  resultsWindow.webContents.send('showLightsResults', leftReferee, centerReferee, rightReferee);

  createAttemptChangeTimer();

  // After showing the lights the timer is automatically reset to the default lift duration (usually 1 minute)
  startNewTimer(config.defaultLiftTimer);

  // Show lights for the configured time before restarting
  setTimeout(() => {
    resetLights();
  }, TIME_SHOWING_LIGHTS);
}

function updateDecisionsResultsScreen() {
  resultsWindow.webContents.send('updateRefereeDecisions', leftReferee, centerReferee, rightReferee);
}

function resetLights() {
  allRefsReady = false;
  leftReferee = ['0', '0', '0', '0'];
  centerReferee = ['0', '0', '0', '0'];
  rightReferee = ['0', '0', '0', '0'];

  resultsWindow.webContents.send('clearLights');

  lock = false;

  clearAll();
}

var allRefsReady = false;

function updateDecisions(dados) {
  leftReferee = dados.slice(1, 5);
  centerReferee = dados.slice(6, 10);
  rightReferee = dados.slice(11);

  updateDecisionsResultsScreen();

  // Each time a referee presses any button, a small buffer (TIME_FOR_DECISION) is added to the time before
  // showing the lights, so that even if all three have already decided, there's time for the last referee
  // to press another button before the lights are shown
  timeShowDecision = utils.getCurrentTime() + TIME_FOR_DECISION;

  if (!allRefsReady && leftReferee.includes('1') && centerReferee.includes('1') && rightReferee.includes('1')) {
    allRefsReady = true;
  }
}

/* --- SETTINGS --- */

function setNetworkConnectionInfo(message) {
  let parts = message.split('|');
  let ipAddress = parts[1];
  let ssid = parts[2];
  let password = parts[3];
  dashboardWindow.webContents.send('networkInfo', ipAddress, ssid, password);
}

/* --- MINI TIMER WINDOW --- */

function createMiniTimerWindow() {
  miniTimerWindow = new BrowserWindow({
    icon: path.join(__dirname, 'ui/assets/faviconTimer.ico'),
    width: 300,
    height: 175,
    backgroundColor: '#ccc',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  miniTimerWindow.setAppDetails({
    appId: 'EasyLifterRefereeMiniTimer',
  });

  miniTimerWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'ui/miniTimer.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  miniTimerWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  miniTimerWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  miniTimerWindow.minimizable = false;
  miniTimerWindow.maximizable = false;

  setTimeout(() => {
    miniTimerWindow.webContents.send('updateTimerStatus', currentTimerStatus);
  }, 500);

  miniTimerWindow.on('close', () => {
    miniTimerWindow = null;
  });

  // set to null
  miniTimerWindow.on('closed', () => {
    miniTimerWindow = null;
  });
}

/* --- ELECTRON WINDOWS --- */

// Keep a global reference of the window objects to prevent them from closing when the object is garbage collected
var dashboardWindow;
var resultsWindow;
var miniTimerWindow;

var isResultsFullScreen = false;

async function createWindows() {
  // Results window (to be shown on TV to the public)
  resultsWindow = new BrowserWindow({
    icon: path.join(__dirname, 'ui/assets/faviconLights.ico'),
    width: 1000,
    height: 800,
    backgroundColor: '#ccc',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true, // to allow require
      contextIsolation: false, // allow use with Electron 12+
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  resultsWindow.setAppDetails({
    appId: 'EasyLifterRefereeResults',
  });
  resultsWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'ui/results.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Dashboard window for controlling the app
  dashboardWindow = new BrowserWindow({
    icon: path.join(__dirname, 'ui/assets/favicon.ico'),
    width: 800,
    height: 600,
    backgroundColor: '#ccc',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true, // to allow require
      contextIsolation: false, // allow use with Electron 12+
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  dashboardWindow.setAppDetails({
    appId: 'EasyLifterRefereePanel',
  });
  dashboardWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'ui/dashboard.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Listeners for UI controls
  ipcMain.on('setFullScreen', (event, args) => {
    isResultsFullScreen = !isResultsFullScreen;
    resultsWindow.setFullScreen(isResultsFullScreen);
  });
  ipcMain.on('showHideTimer', (event, args) => {
    resultsWindow.webContents.send('showHideTimer');
  });
  ipcMain.on('showHideAttempts', (event, args) => {
    resultsWindow.webContents.send('showHideAttempts');
  });

  // Listeners for settings and debug options
  ipcMain.on('showDemo', (event, valid) => {
    resultsWindow.webContents.send('showDemo', valid);
  });

  // Listeners and intervals for the timer
  setInterval(handleTimer, INTERVAL_UPDATE_TIMER);
  ipcMain.on('restartTimer', (event, args) => {
    startNewTimer(args);
  });
  ipcMain.on('playTimer', (event, args) => {
    playTimer(args);
  });
  ipcMain.on('pauseTimer', (event, args) => {
    pauseTimer();
  });
  ipcMain.on('separateTimerWindow', (event, args) => {
    if (miniTimerWindow) {
      miniTimerWindow.focus();
      return;
    }
    createMiniTimerWindow();
  });

  // Listeners and intervals for the attempt changes
  setInterval(() => {
    printAttemptChanges();
  }, INTERVAL_PRINT_ATTEMPT_CHANGES);

  ipcMain.on('createAttemptChangeTimer', (event, args) => {
    createAttemptChangeTimer();
  });

  // Listeners and intervals for referee lights
  setInterval(() => {
    // checking if I can show the lights now...
    if (allRefsReady && !lock && utils.getCurrentTime() > timeShowDecision) {
      showLights();
    }
  }, INTERVAL_CHECK_SHOW_LIGHTS);

  // Listeners and intervals for serial communication
  setInterval(() => {
    checkSerialConnection();
  }, INTERVAL_CHECK_SERIAL_CONNECTION);

  // Quit the app if either the dashboard or the results window are closed.
  // (the mini-timer can be closed by itself with no problems)
  dashboardWindow.on('closed', function () {
    app.quit();
  });
  resultsWindow.on('closed', function () {
    app.quit();
  });
}

// Creates browser windows after Electron has finished initialization
app.on('ready', createWindows);
app.on('activate', function () {
  if (dashboardWindow === null) {
    createWindows();
  }
});
app.on('window-all-closed', function () {
  app.quit();
});
