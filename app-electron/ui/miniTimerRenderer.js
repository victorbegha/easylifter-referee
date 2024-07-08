/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/
const ipcRenderer = require("electron").ipcRenderer;
const localization = require('./localization.js');

/* --- CONFIG AND LOCALIZATION --- */

var config;
(async () => {
  config = await ipcRenderer.invoke('getConfig');
  localization.setTitle('timer', config.language);
})();

const timer = require("./timer.js");
timer.setTimerEvents();