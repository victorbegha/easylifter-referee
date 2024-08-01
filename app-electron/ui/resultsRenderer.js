/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/

const { ipcRenderer } = require('electron');
const localization = require('./localization.js');

/* --- CONFIG AND LOCALIZATION --- */

var config;
(async () => {
  config = await ipcRenderer.invoke('getConfig');
  localization.setTitle('results', config.language);
})();

/* --- LISTENER FOR TIMER --- */

ipcRenderer.on('updateTimer', function (event, text) {
  document.getElementById('timer').innerHTML = text;
  if (text === '00:00' || text === '00:00.00') {
    document.getElementById('timer').style.color = '#c70000';
  } else {
    document.getElementById('timer').style.color = 'white';
  }
});

/* --- LISTENER FOR ATTEMPT CHANGES --- */

ipcRenderer.on('updateAttempts', function (event, text) {
  document.getElementById('attemptChanges').innerHTML = text;
});

ipcRenderer.on('showLightsResults', function (event, left, center, right) {
  showLightsResults(left, center, right);
});

/* --- REFEREE LIGHTS --- */

function showSinglePositionLights(decision, position) {
  if (decision[0] === '1') {
    // If the white button was pressed, show only the white light and no colored cards
    document.getElementById(position + '-result').classList.add('valid-result');
  } else {
    // If any colored button was pressed, show the red light, and each pressed colored card
    document.getElementById(position + '-result').classList.add('invalid-result');
    if (decision[1] === '1') {
      document.getElementById(position + '-red').classList.remove('invisible');
    }
    if (decision[2] === '1') {
      document.getElementById(position + '-blue').classList.remove('invisible');
    }
    if (decision[3] === '1') {
      document.getElementById(position + '-yellow').classList.remove('invisible');
    }
  }
}

function showLightsResults(left, center, right) {
  showSinglePositionLights(left, 'left');
  showSinglePositionLights(center, 'center');
  showSinglePositionLights(right, 'right');

  // Remove the "pending result" outline from all lights
  Array.from(document.getElementsByClassName('large-circle')).forEach(function (el) {
    el.classList.remove('pending-result');
  });
}

function setPendingPosition(decision, position) {
  // If any button was pressed by a referee, the corresponding light will be outlined
  // to show that referee has already given their decision
  if (decision.includes('1')) {
    document.getElementById(position + '-result').classList.add('pending-result');
  } else {
    document.getElementById(position + '-result').classList.remove('pending-result');
  }
}

function updateRefereeDecisions(left, center, right) {
  setPendingPosition(left, 'left');
  setPendingPosition(center, 'center');
  setPendingPosition(right, 'right');
}

function clearLights() {
  Array.from(document.getElementsByClassName('large-circle')).forEach(function (el) {
    el.classList.remove('valid-result');
    el.classList.remove('invalid-result');
    el.classList.remove('pending-result');
  });

  Array.from(document.getElementsByClassName('small-circle')).forEach(function (el) {
    el.classList.add('invisible');
  });
}

/* --- LISTENERS FOR REFEREE LIGHTS --- */

ipcRenderer.on('updateRefereeDecisions', function (event, left, center, right) {
  updateRefereeDecisions(left, center, right);
});
ipcRenderer.on('clearLights', function (event) {
  clearLights();
});

/* --- LISTENERS FOR UI OPTIONS --- */

ipcRenderer.on('showHideTimer', function (event, text) {
  if (document.getElementById('timer').classList.contains('hidden')) {
    document.getElementById('timer').classList.remove('hidden');
  } else {
    document.getElementById('timer').classList.add('hidden');
  }
});

ipcRenderer.on('showHideAttempts', function (event, text) {
  if (document.getElementById('attemptChanges').classList.contains('hidden')) {
    document.getElementById('attemptChanges').classList.remove('hidden');
  } else {
    document.getElementById('attemptChanges').classList.add('hidden');
  }
});

/* --- FULLSCREEN CONTROLS --- */

document.body.addEventListener('keydown', function (e) {
  if (e.key == 'Escape') {
    let forceLeave = true;
    ipcRenderer.send('setFullScreen', forceLeave);
  }
  else if (e.key == 'F11') {
    e.preventDefault();
    ipcRenderer.send('setFullScreen');
  }
});

/* --- DEBUG FUNCTIONS --- */

// Show lights for debugging the layout
function showDemo(valid) {
  if (valid) {
    showLightsResults('1000', '1000', '1000');
  } else {
    showLightsResults('0111', '0111', '0111');
  }
  setTimeout(() => {
    clearLights();
  }, 5000);
}

ipcRenderer.on('showDemo', function (event, valid) {
  showDemo(valid);
});
