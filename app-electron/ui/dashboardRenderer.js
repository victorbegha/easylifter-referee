/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/

const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const localization = require('./localization.js');

/* --- CONFIG AND LOCALIZATION --- */

var config;
(async () => {
  config = await ipcRenderer.invoke('getConfig');
  localization.setTitle('dashboard', config.language);
  localization.setStrings(config.language);
  localization.loadLanguageSettings(config.language);
})();

/* --- TIMER --- */

const timer = require('./timer.js');
timer.setTimerEvents();
timer.setTimer();

/* --- ROUTER CONNECTION --- */

const CONNECTION_STATUSES = require('./enums.js').CONNECTION_STATUSES;

ipcRenderer.on('connectionStatus', function (event, connectionStatus) {
  switch (connectionStatus) {
    case CONNECTION_STATUSES.CONNECTED:
      document.getElementById('connectionStatusCard').style.color = '#22A231';
      document.getElementById('strRouterConnected').classList.remove('hidden');
      document.getElementById('strRouterConnecting').classList.add('hidden');
      document.getElementById('strRouterDisconnected').classList.add('hidden');
      break;
    case CONNECTION_STATUSES.CONNECTING:
      document.getElementById('connectionStatusCard').style.color = '#e0da22';
      document.getElementById('strRouterConnected').classList.add('hidden');
      document.getElementById('strRouterConnecting').classList.remove('hidden');
      document.getElementById('strRouterDisconnected').classList.add('hidden');
      break;
    case CONNECTION_STATUSES.DISCONNECTED:
      document.getElementById('connectionStatusCard').style.color = '#E41F1F';
      document.getElementById('strRouterConnected').classList.add('hidden');
      document.getElementById('strRouterConnecting').classList.add('hidden');
      document.getElementById('strRouterDisconnected').classList.remove('hidden');
      break;
  }
});

/* --- RESULTS SCREEN UI OPTIONS --- */

function setFullScreen() {
  ipcRenderer.send('setFullScreen');
}

function showHideTimer() {
  ipcRenderer.send('showHideTimer');
}

function showHideAttempts() {
  ipcRenderer.send('showHideAttempts');
}

/* --- SETTINGS --- */

ipcRenderer.on('networkInfo', function (event, ipAddress, ssid, password) {
  document.getElementById('ipAddress').innerHTML = '"http://' + ipAddress + '"';
  document.getElementById('ssid').value = ssid;
  document.getElementById('password').value = password;

  document.getElementById('networkWarning').classList.add('hidden');
  document.getElementById('networkInstructions').classList.remove('hidden');
});

function togglePassword(forceHide) {
  let element = document.getElementById('password');
  if (element.type === 'text' || forceHide) {
    element.type = 'password';
  } else {
    element.type = 'text';
  }
}

function saveSettingsRestart() {
  let language = config.language;
  if (document.getElementById('langradioen-us').checked) {
    language = 'en-us';
  } else if (document.getElementById('langradiopt-br').checked) {
    language = 'pt-br';
  }

  config.language = language;

  ipcRenderer.send('setConfigAndRestart', config);
}

function showAdvancedOptions() {
  if (document.getElementById('advancedOptions').classList.contains('hidden')) {
    document.getElementById('advancedOptions').classList.remove('hidden');
  } else {
    document.getElementById('advancedOptions').classList.add('hidden');
  }
}

function openExternalLink(url) {
  ipcRenderer.send('openExternalLink', url);
}

/* --- DEBUG FUNCTIONS --- */

function showDemo(valid) {
  ipcRenderer.send('showDemo', valid);
}

function setAttemptChangeTimer() {
  ipcRenderer.send('createAttemptChangeTimer');
}

function separateTimerWindow() {
  ipcRenderer.send('separateTimerWindow');
}
