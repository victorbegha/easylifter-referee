/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/

const TIMER_STATUSES = {
  STOPPED: 0,
  RUNNING: 1,
  PAUSED: 2,
  EXPIRED: 3,
};

const CONNECTION_STATUSES = {
  DISCONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2
};

module.exports = {TIMER_STATUSES, CONNECTION_STATUSES};