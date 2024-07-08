/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/

const enums = require("./enums.js");
const TIMER_STATUSES = enums.TIMER_STATUSES;

function getTimerInputInMillis() {
    let minutes = parseInt(document.getElementById("timerInput").value.substring(0, 2));
    let seconds = parseInt(document.getElementById("timerInput").value.substring(3, 5));
    return (minutes * 60 + seconds) * 1000;
  }
  
  function setTimer() {
    ipcRenderer.send("restartTimer", getTimerInputInMillis());
  }
  
  function playTimer() {
    ipcRenderer.send("playTimer", getTimerInputInMillis());
  }
  function pauseTimer() {
    ipcRenderer.send("pauseTimer", null);
  }
  function stopTimer() {
    setTimer();
  }
  
  function setTimerEvents() {
    ipcRenderer.on("updateTimer", function (event, text) {
        document.getElementById("timer").innerHTML = text;
      });
      
      ipcRenderer.on("updateAttempts", function (event, text) {
        document.getElementById("attemptChanges").innerHTML = text;
      });
      
      ipcRenderer.on("updateTimerStatus", function (event, status) {
        updateTimerStatus(status);
      });    
  }
  
  
  function updateTimerStatus(status) {
    timerStatus = status;
    console.log("new status" + status);
    switch (timerStatus) {
      case TIMER_STATUSES.STOPPED:
        document.getElementById("playButton").classList.remove("hidden");
        document.getElementById("pauseButton").classList.add("hidden");
        document.getElementById("stopButton").classList.add("hidden");
  
        document.getElementById('timerStatusStopped').classList.remove('hidden');
        document.getElementById('timerStatusRunning').classList.add('hidden');
        document.getElementById('timerStatusPaused').classList.add('hidden');
        document.getElementById('timerStatusExpired').classList.add('hidden');
  
        document.getElementById("timer").style.color = "white";
        break;
      case TIMER_STATUSES.PAUSED:
        document.getElementById("playButton").classList.remove("hidden");
        document.getElementById("pauseButton").classList.add("hidden");
        document.getElementById("stopButton").classList.remove("hidden");
  
        document.getElementById('timerStatusStopped').classList.add('hidden');
        document.getElementById('timerStatusRunning').classList.add('hidden');
        document.getElementById('timerStatusPaused').classList.remove('hidden');
        document.getElementById('timerStatusExpired').classList.add('hidden');
  
        document.getElementById("timer").style.color = "white";
        break;
      case TIMER_STATUSES.RUNNING:
        document.getElementById("playButton").classList.add("hidden");
        document.getElementById("pauseButton").classList.remove("hidden");
        document.getElementById("stopButton").classList.remove("hidden");
  
        document.getElementById('timerStatusStopped').classList.add('hidden');
        document.getElementById('timerStatusRunning').classList.remove('hidden');
        document.getElementById('timerStatusPaused').classList.add('hidden');
        document.getElementById('timerStatusExpired').classList.add('hidden');
  
        document.getElementById("timer").style.color = "white";
        break;
      case TIMER_STATUSES.EXPIRED:
        document.getElementById("playButton").classList.remove("hidden");
        document.getElementById("pauseButton").classList.add("hidden");
        document.getElementById("stopButton").classList.add("hidden");
  
        document.getElementById('timerStatusStopped').classList.add('hidden');
        document.getElementById('timerStatusRunning').classList.add('hidden');
        document.getElementById('timerStatusPaused').classList.add('hidden');
        document.getElementById('timerStatusExpired').classList.remove('hidden');
  
        document.getElementById("timer").style.color = "#c70000";
        break;
    }
  }

  module.exports = {
    getTimerInputInMillis,
    setTimer,
    playTimer,
    pauseTimer,
    stopTimer,
    setTimerEvents,
    updateTimerStatus
};
